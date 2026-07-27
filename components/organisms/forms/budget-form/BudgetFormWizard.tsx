'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FormField } from '@/components/molecules/FormField';
import { StepIndicator } from '@/components/molecules/StepIndicator';
import { TurnstileWidget } from '@/components/molecules/TurnstileWidget';
import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { trackConversionEvent } from '@/lib/analytics/track';
import {
  BUDGET_API_PATH,
  BUDGET_FORM_NAME,
  BUDGET_WIZARD_STEP_LABELS,
  PROFESSIONAL_ROLE_OPTIONS,
  validateFullBudgetLead,
} from '@/lib/forms/budget-wizard';
import {
  interpretLeadSubmitResponse,
  issuesToFieldErrors,
  readUtmParams,
  type LeadApiJson,
} from '@/lib/forms/lead-form-shared';
import { createInitialBudgetDraft, useBudgetForm } from '@/lib/forms/use-budget-form';

export type BudgetFormCatalogs = {
  services: { slug: string; name: string }[];
  provinces: { slug: string; name: string }[];
  workTypologies: { slug: string; name: string }[];
};

export type BudgetFormPrefill = {
  servicio?: string;
  provincia?: string;
  tipoObra?: string;
  plantas?: string;
  superficie?: string;
};

type BudgetFormWizardProps = BudgetFormCatalogs & {
  prefill: BudgetFormPrefill;
};

export function BudgetFormWizard({
  services,
  provinces,
  workTypologies,
  prefill,
}: BudgetFormWizardProps) {
  const router = useRouter();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const formStartedRef = useRef(false);
  const shouldFocusInvalidRef = useRef(false);

  const initial = createInitialBudgetDraft({
    servicio: prefill.servicio ?? '',
    provincia: prefill.provincia ?? '',
    tipoObra: prefill.tipoObra ?? '',
    plantas: prefill.plantas ?? '',
    superficie: prefill.superficie ?? '',
  });

  const {
    step,
    draft,
    patchDraft,
    fieldErrors,
    setFieldErrors,
    goNext,
    goBack,
    validateFieldOnBlur,
    validateCurrentStep,
  } = useBudgetForm(initial);

  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shouldFocusInvalidRef.current) return;
    shouldFocusInvalidRef.current = false;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [fieldErrors]);

  const markFormStart = useCallback(() => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    pushRawDataLayer({
      event: 'form_start',
      form_name: BUDGET_FORM_NAME,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/presupuesto',
    });
  }, []);

  const pushFormStep = useCallback((stepNumber: number) => {
    pushRawDataLayer({
      event: 'form_step',
      form_name: BUDGET_FORM_NAME,
      form_step: stepNumber,
    });
  }, []);

  const focusStepHeading = useCallback(() => {
    stepHeadingRef.current?.focus();
  }, []);

  const handleNext = useCallback(() => {
    markFormStart();
    if (!validateCurrentStep()) {
      shouldFocusInvalidRef.current = true;
      return;
    }
    if (step < 3) {
      const next = (step + 1) as 1 | 2 | 3;
      pushFormStep(next);
      goNext();
      requestAnimationFrame(focusStepHeading);
    }
  }, [focusStepHeading, goNext, markFormStart, pushFormStep, step, validateCurrentStep]);

  const handleBack = useCallback(() => {
    goBack();
    requestAnimationFrame(focusStepHeading);
  }, [focusStepHeading, goBack]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    markFormStart();
    setFieldErrors({});

    if (!validateCurrentStep()) {
      shouldFocusInvalidRef.current = true;
      return;
    }

    const attribution = readUtmParams();
    const parsed = validateFullBudgetLead(
      draft,
      turnstileToken || 'pending',
      attribution,
    );
    if (!parsed.success) {
      setFieldErrors(
        issuesToFieldErrors<keyof typeof draft & string>(parsed.error.issues),
      );
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
      const response = await fetch(BUDGET_API_PATH, {
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
        await trackConversionEvent({
          eventName: 'generate_lead',
          leadType: 'presupuesto',
          serviceSlug: draft.servicio,
          provinceSlug: draft.provincia,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        });
        router.push(
          `/gracias/presupuesto?ref=${encodeURIComponent(outcome.referenceNumber)}`,
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

  const stepTitle =
    step === 1
      ? 'Servicio y ubicación del estudio'
      : step === 2
        ? 'Datos del proyecto'
        : 'Datos de contacto';

  const nextButton = (
    <Button
      type="button"
      variant="primary"
      className="min-h-11 w-full sm:w-auto"
      onClick={handleNext}
      data-testid="budget-form-next"
    >
      Continuar
    </Button>
  );

  const submitButton = (
    <Button
      type="submit"
      variant="primary"
      className="min-h-11 w-full sm:w-auto"
      disabled={submitting}
      aria-busy={submitting}
      data-testid="budget-form-submit"
    >
      {submitting ? 'Enviando…' : 'Solicitar presupuesto'}
    </Button>
  );

  return (
    <form
      ref={formRef}
      id={formId}
      onSubmit={handleSubmit}
      className="rounded-sm border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm md:p-8"
      data-testid="budget-form"
      noValidate
    >
      <StepIndicator
        currentStep={step}
        steps={BUDGET_WIZARD_STEP_LABELS}
        className="mb-8"
      />

      <h2
        ref={stepHeadingRef}
        tabIndex={-1}
        className="font-display text-xl font-semibold text-brand-on-surface outline-none"
      >
        {stepTitle}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {step === 1 &&
          'Seleccione el servicio geotécnico y la provincia donde se ubica el proyecto.'}
        {step === 2 &&
          'Opcional: ayúdenos a dimensionar el estudio con datos básicos del edificio o obra.'}
        {step === 3 &&
          'Indique cómo contactarle. Revisaremos su solicitud y le responderemos en 24–48 h laborables.'}
      </p>

      {fieldErrors.global ? (
        <p className="mt-4 text-sm text-brand-error" role="alert">
          {fieldErrors.global}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 flex flex-col gap-5">
          <FormField id={`${formId}-servicio`} label="Servicio geotécnico" required>
            <Select
              id={`${formId}-servicio`}
              name="servicio"
              required
              value={draft.servicio}
              aria-invalid={!!fieldErrors.servicio}
              onChange={(e) => patchDraft({ servicio: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('servicio')}
            >
              <option value="">Seleccione un servicio</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </Select>
            {fieldErrors.servicio ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.servicio}
              </p>
            ) : null}
          </FormField>

          <FormField id={`${formId}-provincia`} label="Provincia" required>
            <Select
              id={`${formId}-provincia`}
              name="provincia"
              required
              value={draft.provincia}
              aria-invalid={!!fieldErrors.provincia}
              onChange={(e) => patchDraft({ provincia: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('provincia')}
            >
              <option value="">Seleccione provincia</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </Select>
            {fieldErrors.provincia ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.provincia}
              </p>
            ) : null}
          </FormField>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 flex flex-col gap-5">
          <FormField id={`${formId}-tipoObra`} label="Tipología de obra">
            <Select
              id={`${formId}-tipoObra`}
              name="tipoObra"
              value={draft.tipoObra}
              onChange={(e) => patchDraft({ tipoObra: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('tipoObra')}
            >
              <option value="">Sin especificar</option>
              {workTypologies.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id={`${formId}-plantas`} label="Número de plantas">
              <Input
                id={`${formId}-plantas`}
                name="plantas"
                type="number"
                min={1}
                inputMode="numeric"
                value={draft.plantas}
                aria-invalid={!!fieldErrors.plantas}
                onChange={(e) => patchDraft({ plantas: e.target.value })}
                onFocus={markFormStart}
                onBlur={() => validateFieldOnBlur('plantas')}
              />
              {fieldErrors.plantas ? (
                <p className="text-sm text-brand-error" role="alert">
                  {fieldErrors.plantas}
                </p>
              ) : null}
            </FormField>

            <FormField id={`${formId}-superficie`} label="Superficie construida (m²)">
              <Input
                id={`${formId}-superficie`}
                name="superficie"
                type="number"
                min={1}
                step="any"
                inputMode="decimal"
                value={draft.superficie}
                aria-invalid={!!fieldErrors.superficie}
                onChange={(e) => patchDraft({ superficie: e.target.value })}
                onFocus={markFormStart}
                onBlur={() => validateFieldOnBlur('superficie')}
              />
              {fieldErrors.superficie ? (
                <p className="text-sm text-brand-error" role="alert">
                  {fieldErrors.superficie}
                </p>
              ) : null}
            </FormField>
          </div>

          <FormField id={`${formId}-fase`} label="Fase del proyecto">
            <Input
              id={`${formId}-fase`}
              name="fase"
              value={draft.fase}
              placeholder="Ej. anteproyecto, proyecto básico…"
              onChange={(e) => patchDraft({ fase: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('fase')}
            />
          </FormField>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 flex flex-col gap-5">
          <FormField id={`${formId}-nombre`} label="Nombre y apellidos" required>
            <Input
              id={`${formId}-nombre`}
              name="nombre"
              autoComplete="name"
              required
              value={draft.nombre}
              aria-invalid={!!fieldErrors.nombre}
              onChange={(e) => patchDraft({ nombre: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('nombre')}
            />
            {fieldErrors.nombre ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.nombre}
              </p>
            ) : null}
          </FormField>

          <FormField id={`${formId}-empresa`} label="Empresa">
            <Input
              id={`${formId}-empresa`}
              name="empresa"
              autoComplete="organization"
              value={draft.empresa}
              onChange={(e) => patchDraft({ empresa: e.target.value })}
              onFocus={markFormStart}
            />
          </FormField>

          <FormField id={`${formId}-email`} label="Email" required>
            <Input
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              aria-invalid={!!fieldErrors.email}
              onChange={(e) => patchDraft({ email: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('email')}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </FormField>

          <FormField id={`${formId}-telefono`} label="Teléfono" required>
            <Input
              id={`${formId}-telefono`}
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
              value={draft.telefono}
              aria-invalid={!!fieldErrors.telefono}
              onChange={(e) => patchDraft({ telefono: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('telefono')}
            />
            {fieldErrors.telefono ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.telefono}
              </p>
            ) : null}
          </FormField>

          <FormField id={`${formId}-rol`} label="Su rol en el proyecto" required>
            <Select
              id={`${formId}-rol`}
              name="rol"
              required
              value={draft.rol}
              aria-invalid={!!fieldErrors.rol}
              onChange={(e) => patchDraft({ rol: e.target.value })}
              onFocus={markFormStart}
              onBlur={() => validateFieldOnBlur('rol')}
            >
              <option value="">Seleccione su rol</option>
              {PROFESSIONAL_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            {fieldErrors.rol ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.rol}
              </p>
            ) : null}
          </FormField>

          <Checkbox
            id={`${formId}-gdpr`}
            name="gdprConsent"
            checked={draft.gdprConsent}
            onChange={(e) => patchDraft({ gdprConsent: e.target.checked })}
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
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {step > 1 ? (
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={handleBack}>
            Atrás
          </Button>
        ) : null}
        {step < 3 ? (
          nextButton
        ) : (
          <>
            <div className="hidden md:block">{submitButton}</div>
            <StickyCtaBar>{submitButton}</StickyCtaBar>
          </>
        )}
      </div>
    </form>
  );
}
