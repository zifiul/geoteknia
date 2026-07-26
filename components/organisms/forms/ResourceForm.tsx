'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type { ZodIssue } from 'zod';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { TurnstileWidget } from '@/components/molecules/TurnstileWidget';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { professionalRoleSchema, resourceLeadSchema } from '@/lib/leads/schema';

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'propiedad', label: 'Propiedad' },
  { value: 'promotor', label: 'Promotor' },
  { value: 'constructor', label: 'Constructor' },
  { value: 'arquitecto', label: 'Arquitecto' },
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'otro', label: 'Otro' },
];

type FieldKey = 'nombre' | 'empresa' | 'email' | 'telefono' | 'rol' | 'gdprConsent';

function sanitizePrefill(value: string | null, max: number): string {
  if (!value) return '';
  return value.trim().slice(0, max);
}

function issuesToFieldErrors(
  issues: ZodIssue[],
): Partial<Record<FieldKey | 'global', string>> {
  const map: Partial<Record<FieldKey | 'global', string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in map)) {
      map[key as FieldKey] = issue.message;
    }
  }
  return map;
}

function readUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingUrl?: string;
} {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.trim();
  const utmMedium = params.get('utm_medium')?.trim();
  const utmCampaign = params.get('utm_campaign')?.trim();
  return {
    ...(utmSource ? { utmSource: utmSource.slice(0, 200) } : {}),
    ...(utmMedium ? { utmMedium: utmMedium.slice(0, 200) } : {}),
    ...(utmCampaign ? { utmCampaign: utmCampaign.slice(0, 200) } : {}),
    landingUrl: window.location.href,
  };
}

type ResourceFormProps = {
  slug: string;
  resourceTitle: string;
};

export function ResourceForm({ slug, resourceTitle }: ResourceFormProps) {
  const searchParams = useSearchParams();
  const defaultRol = sanitizePrefill(searchParams.get('rol'), 32);

  return (
    <ResourceFormFields
      key={defaultRol}
      slug={slug}
      resourceTitle={resourceTitle}
      defaultRol={defaultRol}
    />
  );
}

type ResourceFormFieldsProps = ResourceFormProps & {
  defaultRol: string;
};

function ResourceFormFields({ slug, resourceTitle, defaultRol }: ResourceFormFieldsProps) {
  const router = useRouter();
  const formId = useId();
  const formStartedRef = useRef(false);
  const apiPath = `/api/recursos/${encodeURIComponent(slug)}`;

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState(() =>
    professionalRoleSchema.safeParse(defaultRol).success ? defaultRol : '',
  );
  const [gdprConsent, setGdprConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey | 'global', string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const markFormStart = useCallback(() => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    pushRawDataLayer({
      event: 'form_start',
      form_name: 'recurso',
      page_path: typeof window !== 'undefined' ? window.location.pathname : `/recursos/${slug}`,
    });
  }, [slug]);

  const validateField = useCallback(
    (field: FieldKey) => {
      const payload = {
        nombre,
        email,
        empresa: empresa || undefined,
        telefono: telefono || undefined,
        rol:
          rol && professionalRoleSchema.safeParse(rol).success
            ? professionalRoleSchema.parse(rol)
            : undefined,
        gdprConsent: gdprConsent ? true : (false as const),
        turnstileToken: turnstileToken || 'pending',
        ...readUtmParams(),
      };
      const parsed = resourceLeadSchema.safeParse(payload);
      if (parsed.success) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
        return;
      }
      const related = parsed.error.issues.filter((i) => i.path[0] === field);
      if (related.length > 0) {
        setFieldErrors((prev) => ({ ...prev, [field]: related[0]?.message }));
      }
    },
    [email, empresa, gdprConsent, nombre, rol, telefono, turnstileToken],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const payload = {
      nombre,
      email,
      empresa: empresa || undefined,
      telefono: telefono || undefined,
      rol:
        rol && professionalRoleSchema.safeParse(rol).success
          ? professionalRoleSchema.parse(rol)
          : undefined,
      gdprConsent: gdprConsent ? true : (false as const),
      turnstileToken: turnstileToken || 'pending',
      ...readUtmParams(),
    };

    const parsed = resourceLeadSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues));
      return;
    }

    if (!turnstileToken) {
      setFieldErrors({
        global: 'Completa la verificación anti-spam antes de enviar.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });
      const json = (await response.json()) as {
        success?: boolean;
        data?: {
          referenceNumber?: string;
          downloadUrl?: string;
          thankYouUrl?: string;
        };
        error?: { message?: string; code?: string };
      };

      if (
        response.status === 201 &&
        json.success &&
        json.data?.referenceNumber &&
        json.data.downloadUrl
      ) {
        const ref = json.data.referenceNumber;
        const thankYouBase = json.data.thankYouUrl?.startsWith('/')
          ? json.data.thankYouUrl
          : '/gracias/recurso';
        const thankYou = new URL(thankYouBase, window.location.origin);
        thankYou.searchParams.set('ref', ref);
        const download = new URL(json.data.downloadUrl, window.location.origin);
        thankYou.searchParams.set('download', `${download.pathname}${download.search}`);
        router.push(`${thankYou.pathname}${thankYou.search}`);
        return;
      }

      if (response.status === 403 && json.error?.code === 'TURNSTILE_INVALID') {
        setTurnstileToken('');
        setFieldErrors({
          global: 'La verificación anti-spam ha fallado. Inténtelo de nuevo.',
        });
        return;
      }

      if (response.status === 429) {
        setFieldErrors({
          global: 'Demasiados intentos. Espere un momento y vuelva a intentarlo.',
        });
        return;
      }

      if (response.status === 400 && json.error?.message) {
        setFieldErrors({ global: json.error.message });
        return;
      }

      setFieldErrors({
        global: json.error?.message ?? 'No se pudo enviar el formulario. Inténtelo más tarde.',
      });
    } catch {
      setFieldErrors({
        global: 'Error de red. Compruebe su conexión e inténtelo de nuevo.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="rounded-xl border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm md:p-8"
      data-testid="resource-form"
      noValidate
      aria-busy={submitting}
    >
      <h2 className="font-display text-xl font-semibold text-brand-on-surface">
        Descargar recurso
      </h2>
      <p className="mt-2 text-sm text-muted">
        Complete el formulario para recibir «{resourceTitle}» en su correo y descargarlo al
        instante.
      </p>

      {fieldErrors.global ? (
        <p className="mt-4 text-sm text-brand-error" role="alert">
          {fieldErrors.global}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-5">
        <FormField id={`${formId}-nombre`} label="Nombre y apellidos" required>
          <Input
            id={`${formId}-nombre`}
            name="nombre"
            autoComplete="name"
            required
            aria-invalid={!!fieldErrors.nombre}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('nombre')}
          />
          {fieldErrors.nombre ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.nombre}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-email`} label="Email profesional" required>
          <Input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!fieldErrors.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('email')}
          />
          {fieldErrors.email ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-empresa`} label="Empresa">
          <Input
            id={`${formId}-empresa`}
            name="empresa"
            autoComplete="organization"
            aria-invalid={!!fieldErrors.empresa}
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            onBlur={() => validateField('empresa')}
          />
          {fieldErrors.empresa ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.empresa}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-rol`} label="Rol profesional">
          <select
            id={`${formId}-rol`}
            name="rol"
            className="w-full rounded-sm border border-brand-secondary/20 bg-brand-surface px-3 py-2 text-sm text-brand-on-surface"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            onBlur={() => validateField('rol')}
          >
            <option value="">Seleccione (opcional)</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id={`${formId}-telefono`} label="Teléfono">
          <Input
            id={`${formId}-telefono`}
            name="telefono"
            type="tel"
            autoComplete="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            onBlur={() => validateField('telefono')}
          />
          {fieldErrors.telefono ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.telefono}
            </p>
          ) : null}
        </FormField>

        <Checkbox
          id={`${formId}-gdpr`}
          name="gdprConsent"
          checked={gdprConsent}
          onChange={(e) => setGdprConsent(e.target.checked)}
          aria-invalid={!!fieldErrors.gdprConsent}
          label={
            <>
              Acepto la{' '}
              <Link href="/privacidad" className="text-brand-accent underline-offset-2 hover:underline">
                política de privacidad
              </Link>{' '}
              y el tratamiento de mis datos para enviarme el recurso solicitado.
            </>
          }
        />
        {fieldErrors.gdprConsent ? (
          <p className="text-sm text-brand-error" role="alert">
            {fieldErrors.gdprConsent}
          </p>
        ) : null}

        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
        />
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Obtener descarga'}
      </Button>
    </form>
  );
}
