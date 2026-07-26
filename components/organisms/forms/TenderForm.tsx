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

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { TurnstileWidget } from '@/components/molecules/TurnstileWidget';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { trackConversionEvent } from '@/lib/analytics/track';
import {
  interpretLeadSubmitResponse,
  issuesToFieldErrors,
  readUtmParams,
  sanitizePrefill,
  type LeadApiJson,
} from '@/lib/forms/lead-form-shared';
import { tenderLeadSchema } from '@/lib/leads/schema';

const API_PATH = '/api/leads/licitacion';

type FieldKey =
  | 'nombre'
  | 'empresa'
  | 'email'
  | 'telefono'
  | 'organismo'
  | 'expedienteRef'
  | 'plataformaUrl'
  | 'importeEstimado'
  | 'provincia'
  | 'gdprConsent';

function issuesToFieldErrorsLocal(issues: import('zod').ZodIssue[]): Partial<Record<FieldKey | 'global', string>> {
  return issuesToFieldErrors<FieldKey>(issues);
}

export function TenderForm() {
  const searchParams = useSearchParams();
  const defaultOrganismo = sanitizePrefill(searchParams.get('organismo'), 200);
  const defaultExpedienteRef = sanitizePrefill(searchParams.get('expediente'), 200);

  return (
    <TenderFormFields
      key={`${defaultOrganismo}|${defaultExpedienteRef}`}
      defaultOrganismo={defaultOrganismo}
      defaultExpedienteRef={defaultExpedienteRef}
    />
  );
}

type TenderFormFieldsProps = {
  defaultOrganismo: string;
  defaultExpedienteRef: string;
};

function TenderFormFields({
  defaultOrganismo,
  defaultExpedienteRef,
}: TenderFormFieldsProps) {
  const router = useRouter();
  const formId = useId();
  const formStartedRef = useRef(false);

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [organismo, setOrganismo] = useState(defaultOrganismo);
  const [expedienteRef, setExpedienteRef] = useState(defaultExpedienteRef);
  const [plataformaUrl, setPlataformaUrl] = useState('');
  const [importeEstimado, setImporteEstimado] = useState('');
  const [provincia, setProvincia] = useState('');
  const [esUte, setEsUte] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey | 'global', string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const markFormStart = useCallback(() => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    pushRawDataLayer({
      event: 'form_start',
      form_name: 'licitacion',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/licitaciones',
    });
  }, []);

  const pushFormStep = useCallback((step: number) => {
    pushRawDataLayer({
      event: 'form_step',
      form_name: 'licitacion',
      form_step: step,
    });
  }, []);

  const validateField = useCallback(
    (field: FieldKey) => {
      const payload = buildPayload({
        nombre,
        empresa,
        email,
        telefono,
        organismo,
        expedienteRef,
        plataformaUrl,
        importeEstimado,
        provincia,
        esUte,
        gdprConsent,
        turnstileToken: turnstileToken || 'pending',
      });
      const parsed = tenderLeadSchema.safeParse(payload);
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
    [
      email,
      empresa,
      expedienteRef,
      gdprConsent,
      importeEstimado,
      nombre,
      organismo,
      plataformaUrl,
      provincia,
      telefono,
      turnstileToken,
      esUte,
    ],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const payload = buildPayload({
      nombre,
      empresa,
      email,
      telefono,
      organismo,
      expedienteRef,
      plataformaUrl,
      importeEstimado,
      provincia,
      esUte,
      gdprConsent,
      turnstileToken: turnstileToken || 'pending',
      ...readUtmParams(),
    });

    const parsed = tenderLeadSchema.safeParse(payload);
    if (!parsed.success) {
      const errors = issuesToFieldErrorsLocal(parsed.error.issues);
      setFieldErrors(errors);
      return;
    }

    if (!turnstileToken) {
      setFieldErrors({
        global: 'Completa la verificación anti-spam antes de enviar.',
      });
      return;
    }

    const submitBody = { ...parsed.data, turnstileToken };

    setSubmitting(true);
    try {
      const response = await fetch(API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitBody),
      });
      const json = (await response.json()) as LeadApiJson;

      const outcome = interpretLeadSubmitResponse(
        response.status,
        json,
        'No se pudo enviar el formulario. Inténtelo más tarde.',
      );

      if (outcome.kind === 'success') {
        const ref = outcome.referenceNumber;
        await trackConversionEvent({
          eventName: 'generate_lead',
          leadType: 'licitacion',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        });
        router.push(`/gracias/licitacion?ref=${encodeURIComponent(ref)}`);
        return;
      }

      if (outcome.kind === 'turnstile_invalid') {
        setTurnstileToken('');
        setFieldErrors({
          global: 'La verificación anti-spam ha fallado. Inténtelo de nuevo.',
        });
        return;
      }

      if (outcome.kind === 'rate_limited') {
        setFieldErrors({
          global: 'Demasiados intentos. Espere un momento y vuelva a intentarlo.',
        });
        return;
      }

      if (outcome.kind === 'validation') {
        setFieldErrors({ global: outcome.message });
        return;
      }

      setFieldErrors({ global: outcome.message });
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
      className="rounded-sm border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm md:p-8"
      data-testid="tender-form"
      noValidate
    >
      <h2 className="font-display text-xl font-semibold text-brand-on-surface">
        Solicitud para licitación
      </h2>
      <p className="mt-2 text-sm text-muted">
        Indique la referencia de expediente o el enlace a la plataforma de contratación del estado.
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
            aria-describedby={fieldErrors.nombre ? `${formId}-nombre-err` : undefined}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => {
              validateField('nombre');
              pushFormStep(1);
            }}
          />
          {fieldErrors.nombre ? (
            <p id={`${formId}-nombre-err`} className="text-sm text-brand-error" role="alert">
              {fieldErrors.nombre}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-empresa`} label="Empresa" required>
          <Input
            id={`${formId}-empresa`}
            name="empresa"
            autoComplete="organization"
            required
            aria-invalid={!!fieldErrors.empresa}
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('empresa')}
          />
          {fieldErrors.empresa ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.empresa}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-email`} label="Email corporativo" required>
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

        <FormField id={`${formId}-telefono`} label="Teléfono">
          <Input
            id={`${formId}-telefono`}
            name="telefono"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!fieldErrors.telefono}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('telefono')}
          />
          {fieldErrors.telefono ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.telefono}
            </p>
          ) : null}
        </FormField>

        <FormField id={`${formId}-organismo`} label="Organismo contratante">
          <Input
            id={`${formId}-organismo`}
            name="organismo"
            value={organismo}
            onChange={(e) => setOrganismo(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('organismo')}
          />
        </FormField>

        <FormField
          id={`${formId}-expediente`}
          label="Referencia de expediente"
          hint="Obligatorio si no indica URL de plataforma"
        >
          <Input
            id={`${formId}-expediente`}
            name="expedienteRef"
            aria-invalid={!!fieldErrors.expedienteRef}
            value={expedienteRef}
            onChange={(e) => setExpedienteRef(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('expedienteRef')}
          />
          {fieldErrors.expedienteRef ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.expedienteRef}
            </p>
          ) : null}
        </FormField>

        <FormField
          id={`${formId}-plataforma`}
          label="Enlace plataforma de contratación"
          hint="https://…"
        >
          <Input
            id={`${formId}-plataforma`}
            name="plataformaUrl"
            type="url"
            inputMode="url"
            aria-invalid={!!fieldErrors.plataformaUrl}
            value={plataformaUrl}
            onChange={(e) => setPlataformaUrl(e.target.value)}
            onFocus={markFormStart}
            onBlur={() => validateField('plataformaUrl')}
          />
          {fieldErrors.plataformaUrl ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.plataformaUrl}
            </p>
          ) : null}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id={`${formId}-importe`} label="Importe estimado (€)">
            <Input
              id={`${formId}-importe`}
              name="importeEstimado"
              type="number"
              min={0}
              step="any"
              value={importeEstimado}
              onChange={(e) => setImporteEstimado(e.target.value)}
              onFocus={markFormStart}
            />
          </FormField>
          <FormField id={`${formId}-provincia`} label="Provincia">
            <Input
              id={`${formId}-provincia`}
              name="provincia"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              onFocus={markFormStart}
              onBlur={() => validateField('provincia')}
            />
          </FormField>
        </div>

        <Checkbox
          id={`${formId}-ute`}
          name="esUte"
          checked={esUte}
          onChange={(e) => setEsUte(e.target.checked)}
          label="La obra se ejecutará en UTE o con subcontratación"
        />

        <Checkbox
          id={`${formId}-gdpr`}
          name="gdprConsent"
          checked={gdprConsent}
          onChange={(e) => setGdprConsent(e.target.checked)}
          aria-invalid={!!fieldErrors.gdprConsent}
          label={
            <>
              He leído y acepto la{' '}
              <Link href="/privacidad" className="text-brand-accent underline">
                política de privacidad
              </Link>
              .
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
          onError={() =>
            setFieldErrors({
              global: 'No se pudo cargar la verificación anti-spam.',
            })
          }
          onExpire={() => setTurnstileToken('')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={submitting}
          aria-busy={submitting}
          data-testid="tender-submit"
        >
          {submitting ? 'Enviando…' : 'Enviar solicitud'}
        </Button>
      </div>
    </form>
  );
}

type BuildPayloadInput = {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  organismo: string;
  expedienteRef: string;
  plataformaUrl: string;
  importeEstimado: string;
  provincia: string;
  esUte: boolean;
  gdprConsent: boolean;
  turnstileToken: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingUrl?: string;
};

function buildPayload(input: BuildPayloadInput): Record<string, unknown> {
  const importe =
    input.importeEstimado.trim() === ''
      ? undefined
      : Number.parseFloat(input.importeEstimado);

  return {
    nombre: input.nombre,
    empresa: input.empresa,
    email: input.email,
    ...(input.telefono.trim() ? { telefono: input.telefono } : {}),
    ...(input.organismo.trim() ? { organismo: input.organismo } : {}),
    ...(input.expedienteRef.trim() ? { expedienteRef: input.expedienteRef } : {}),
    ...(input.plataformaUrl.trim() ? { plataformaUrl: input.plataformaUrl } : {}),
    ...(importe !== undefined && !Number.isNaN(importe) ? { importeEstimado: importe } : {}),
    ...(input.esUte ? { esUte: true } : {}),
    ...(input.provincia.trim() ? { provincia: input.provincia } : {}),
    gdprConsent: input.gdprConsent ? true : undefined,
    turnstileToken: input.turnstileToken,
    ...(input.utmSource ? { utmSource: input.utmSource } : {}),
    ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
    ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
    ...(input.landingUrl ? { landingUrl: input.landingUrl } : {}),
  };
}
