import Link from 'next/link';

import { LinkButton } from '@/components/atoms/LinkButton';
import { Alert } from '@/components/molecules/Alert';
import {
  RESPONSE_DEADLINE_COPY,
  resolveTechnicianDisplayName,
} from '@/lib/leads/confirmation-copy';
import type { ThankYouKindConfig } from '@/lib/thankyou/config';

import { ThankYouConversionPing } from './ThankYouConversionPing.client';

export type ThankYouConfirmationProps = {
  config: ThankYouKindConfig;
  referenceNumber: string | null;
  downloadUrl: string | null;
};

function CheckIcon() {
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-success/15 text-brand-success"
      aria-hidden
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export function ThankYouConfirmation({
  config,
  referenceNumber,
  downloadUrl,
}: ThankYouConfirmationProps) {
  const hasReference = Boolean(referenceNumber);
  const headline = hasReference
    ? config.headlineSuccess
    : config.headlineGeneric;
  const body = hasReference ? config.bodySuccess : config.bodyGeneric;
  const technicianLabel = resolveTechnicianDisplayName(null);

  return (
    <div className="bg-brand-neutral py-section">
      <ThankYouConversionPing
        referenceNumber={referenceNumber}
        eventName={config.eventName}
        leadType={config.leadType}
      />
      <div className="mx-auto max-w-[640px] px-4">
        <article className="rounded-lg border border-brand-secondary/15 bg-white px-6 py-10 shadow-sm md:px-10 md:py-12">
          <div className="flex flex-col items-center text-center">
            <CheckIcon />
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-brand-on-surface md:text-4xl">
              {headline}
            </h1>
            <p className="mt-3 max-w-lg text-body-lg text-brand-secondary">
              {body}
            </p>
          </div>

          <Alert
            variant="success"
            role="status"
            className="mt-8"
            title={hasReference ? 'Solicitud confirmada' : 'Confirmación'}
          >
            {hasReference ? (
              <div className="space-y-3 text-left">
                <p>
                  Número de referencia:{' '}
                  <span
                    className="font-mono text-body-md font-semibold text-brand-on-surface"
                    data-testid="thank-you-reference"
                  >
                    {referenceNumber}
                  </span>
                </p>
                {config.showTechnicianBlock ? (
                  <p className="text-body-md text-brand-secondary">
                    <span className="font-medium text-brand-on-surface">
                      {technicianLabel}
                    </span>{' '}
                    le atenderá en un plazo de{' '}
                    <span className="font-medium text-brand-on-surface">
                      {RESPONSE_DEADLINE_COPY}
                    </span>
                    .
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-body-md text-brand-secondary">
                Si necesita ayuda inmediata, utilice los canales de contacto del
                pie de página.
              </p>
            )}
          </Alert>

          {downloadUrl ? (
            <div className="mt-8 flex flex-col items-stretch gap-2 sm:items-center">
              <LinkButton
                href={downloadUrl}
                className="w-full sm:w-auto"
                data-testid="thank-you-download"
              >
                Descargar recurso
              </LinkButton>
              <p className="text-center text-sm text-brand-secondary">
                El enlace es personal; no lo comparta públicamente.
              </p>
            </div>
          ) : null}

          <section
            className="mt-10 border-t border-brand-secondary/10 pt-8"
            aria-labelledby="thank-you-next-steps"
          >
            <h2
              id="thank-you-next-steps"
              className="text-headline-sm font-semibold text-brand-on-surface"
            >
              Próximos pasos
            </h2>
            <ul className="mt-4 space-y-4">
              {config.nextSteps.map((step) => (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className="group block rounded-md border border-transparent px-2 py-2 transition-colors hover:border-brand-secondary/15 hover:bg-brand-neutral/80"
                  >
                    <span className="font-semibold text-brand-accent group-hover:underline">
                      {step.label}
                    </span>
                    <span className="mt-0.5 block text-body-md text-brand-secondary">
                      {step.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
