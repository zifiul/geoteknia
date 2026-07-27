'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/molecules/Dialog';
import { FormField } from '@/components/molecules/FormField';
import { TurnstileWidget } from '@/components/molecules/TurnstileWidget';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { trackConversionEvent } from '@/lib/analytics/track';
import {
  interpretLeadSubmitResponse,
  issuesToFieldErrors,
  readUtmParams,
  type LeadApiJson,
} from '@/lib/forms/lead-form-shared';
import { locationLeadSchema } from '@/lib/leads/schema';
import { parseContactContextSlugs } from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

const API_PATH = '/api/leads/ubicacion';

type FieldKey =
  | 'cadastralRef'
  | 'email'
  | 'telefono'
  | 'nombre'
  | 'gdprConsent'
  | 'mapLat'
  | 'mapLng';

export type LocationWidgetProps = {
  serviceSlug?: string;
  provinceSlug?: string;
  className?: string;
};

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function buildPayload(input: {
  cadastralRef: string;
  email: string;
  telefono: string;
  nombre: string;
  provincia?: string;
  mapLat?: number;
  mapLng?: number;
  gdprConsent: boolean;
  turnstileToken: string;
}) {
  const utm = readUtmParams();
  return {
    ...(input.cadastralRef.trim() ? { cadastralRef: input.cadastralRef.trim() } : {}),
    ...(input.mapLat !== undefined && input.mapLng !== undefined
      ? { mapLat: input.mapLat, mapLng: input.mapLng }
      : {}),
    ...(input.nombre.trim() ? { nombre: input.nombre.trim() } : {}),
    ...(input.email.trim() ? { email: input.email.trim() } : {}),
    ...(input.telefono.trim() ? { telefono: input.telefono.trim() } : {}),
    ...(input.provincia ? { provincia: input.provincia } : {}),
    gdprConsent: input.gdprConsent ? (true as const) : undefined,
    turnstileToken: input.turnstileToken,
    ...utm,
  };
}

export function LocationWidget({
  serviceSlug: serviceSlugProp,
  provinceSlug: provinceSlugProp,
  className,
}: LocationWidgetProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = useId();
  const formStartedRef = useRef(false);

  const context = useMemo(
    () => parseContactContextSlugs(pathname, searchParams),
    [pathname, searchParams],
  );
  const serviceSlug = serviceSlugProp ?? context.serviceSlug;
  const provinceSlug = provinceSlugProp ?? context.provinceSlug;

  const [open, setOpen] = useState(false);
  const [cadastralRef, setCadastralRef] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [mapLat, setMapLat] = useState<number | undefined>();
  const [mapLng, setMapLng] = useState<number | undefined>();
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
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
      form_name: 'ubicacion',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
      ...(serviceSlug ? { service_slug: serviceSlug } : {}),
      ...(provinceSlug ? { province_slug: provinceSlug } : {}),
    });
  }, [provinceSlug, serviceSlug]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        markFormStart();
      }
    },
    [markFormStart],
  );

  const useCurrentLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('error');
      setFieldErrors((prev) => ({
        ...prev,
        global: 'Tu navegador no permite geolocalización.',
      }));
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapLat(pos.coords.latitude);
        setMapLng(pos.coords.longitude);
        setGeoStatus('ok');
        setFieldErrors((prev) => {
          const { global, mapLat, mapLng, ...rest } = prev;
          void global;
          void mapLat;
          void mapLng;
          return rest;
        });
      },
      () => {
        setGeoStatus('error');
        setFieldErrors((prev) => ({
          ...prev,
          global: 'No se pudo obtener la ubicación. Indica la referencia catastral.',
        }));
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const payload = buildPayload({
      cadastralRef,
      email,
      telefono,
      nombre,
      provincia: provinceSlug,
      mapLat,
      mapLng,
      gdprConsent,
      turnstileToken: turnstileToken || 'pending',
    });

    const parsed = locationLeadSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors<FieldKey>(parsed.error.issues));
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
      const response = await fetch(API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });
      const json = (await response.json()) as LeadApiJson;

      const outcome = interpretLeadSubmitResponse(
        response.status,
        json,
        'No se pudo enviar la ubicación. Inténtelo más tarde.',
      );

      if (outcome.kind === 'success') {
        await trackConversionEvent({
          eventName: 'send_location',
          leadType: 'ubicacion',
          ...(serviceSlug ? { serviceSlug } : {}),
          ...(provinceSlug ? { provinceSlug } : {}),
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        });
        router.push(
          `/gracias/ubicacion?ref=${encodeURIComponent(outcome.referenceNumber)}`,
        );
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
    <div className={cn('pointer-events-none', className)}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-testid="location-widget-trigger"
            className={cn(
              'pointer-events-auto fixed bottom-20 right-4 z-30 flex min-h-11 min-w-11 items-center gap-2 rounded-full bg-brand-accent px-4 py-3 text-body-sm font-semibold !text-white shadow-card',
              'hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
              'md:bottom-6 md:right-6',
            )}
            aria-haspopup="dialog"
          >
            <LocationPinIcon className="shrink-0" />
            <span className="max-sm:sr-only">Enviar ubicación</span>
          </button>
        </DialogTrigger>
        <DialogContent
          data-testid="location-widget-dialog"
          className={cn(
            'pointer-events-auto max-md:left-0 max-md:right-0 max-md:top-auto max-md:max-h-[min(90vh,640px)] max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0',
            'max-md:rounded-b-none max-md:rounded-t-xl max-md:overflow-y-auto',
          )}
          aria-busy={submitting}
        >
          <DialogTitle>Enviar ubicación de la parcela</DialogTitle>
          <DialogDescription className="mt-1 text-muted">
            Referencia catastral o tu ubicación actual más un contacto. Menos de un
            minuto.
          </DialogDescription>

          <form
            id={formId}
            className="mt-6 flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {fieldErrors.global ? (
              <p className="text-body-sm text-red-700" role="alert">
                {fieldErrors.global}
              </p>
            ) : null}

            <FormField
              id={`${formId}-cadastral`}
              label="Referencia catastral"
            >
              <Input
                id={`${formId}-cadastral`}
                name="cadastralRef"
                autoComplete="off"
                value={cadastralRef}
                onChange={(e) => setCadastralRef(e.target.value)}
                placeholder="Ej. 1234567DF1234N0001WX"
                aria-invalid={!!fieldErrors.cadastralRef}
              />
              {fieldErrors.cadastralRef ? (
                <p className="text-sm text-brand-error" role="alert">
                  {fieldErrors.cadastralRef}
                </p>
              ) : null}
            </FormField>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 w-full sm:w-auto"
                disabled={geoStatus === 'loading'}
                onClick={useCurrentLocation}
              >
                {geoStatus === 'loading' ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
              </Button>
              {geoStatus === 'ok' && mapLat !== undefined && mapLng !== undefined ? (
                <p className="text-body-sm text-muted" aria-live="polite">
                  Coordenadas listas ({mapLat.toFixed(4)}, {mapLng.toFixed(4)})
                </p>
              ) : null}
            </div>

            <FormField id={`${formId}-email`} label="Email">
              <Input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
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
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                aria-invalid={!!fieldErrors.telefono}
              />
              {fieldErrors.telefono ? (
                <p className="text-sm text-brand-error" role="alert">
                  {fieldErrors.telefono}
                </p>
              ) : null}
            </FormField>

            <FormField id={`${formId}-nombre`} label="Nombre (opcional)">
              <Input
                id={`${formId}-nombre`}
                name="nombre"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {fieldErrors.nombre ? (
                <p className="text-sm text-brand-error" role="alert">
                  {fieldErrors.nombre}
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
                  <Link href="/privacidad" className="text-brand-accent underline">
                    política de privacidad
                  </Link>
                </>
              }
            />
            {fieldErrors.gdprConsent ? (
              <p className="text-body-sm text-red-700" role="alert">
                {fieldErrors.gdprConsent}
              </p>
            ) : null}

            <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

            <Button
              type="submit"
              data-testid="location-widget-submit"
              className="min-h-11 w-full"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'Enviando…' : 'Enviar ubicación'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
