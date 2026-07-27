'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import type { CalculatorEstimateData, CalculatorPrefill } from '@/lib/calculator/schema';
import { buildPresupuestoHrefFromPrefill } from '@/lib/calculator/presupuesto-href';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { cn } from '@/lib/shared/cn';

export type ResultPanelProps = {
  mode: 'idle' | 'success' | 'no_rule';
  estimate?: CalculatorEstimateData;
  prefill?: CalculatorPrefill;
  noRuleMessage?: string;
  hostServiceSlug?: string;
};

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-md border border-brand-secondary/15 bg-brand-neutral/20 p-4">
      <span
        className="mt-1 h-8 w-1 shrink-0 rounded-full bg-brand-accent"
        aria-hidden
      />
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-base font-semibold text-brand-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function ResultPanel({
  mode,
  estimate,
  prefill,
  noRuleMessage,
  hostServiceSlug,
}: ResultPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (mode === 'success' || mode === 'no_rule') {
      headingRef.current?.focus();
    }
  }, [mode]);

  if (mode === 'idle') {
    return (
      <div
        className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-secondary/25 bg-brand-neutral/30 px-6 py-10 text-center"
        data-testid="calculator-result-idle"
      >
        <p className="max-w-sm text-base text-muted">
          Introduce los datos del proyecto para ver el alcance estimado.
        </p>
      </div>
    );
  }

  const activePrefill = prefill ?? estimate?.prefill;
  const presupuestoHref =
    activePrefill != null
      ? buildPresupuestoHrefFromPrefill(activePrefill, { hostServiceSlug })
      : '/presupuesto';

  const handleCtaClick = () => {
    pushRawDataLayer({
      event: 'cta_click',
      cta_name: 'calculator_presupuesto',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/calculadora',
    });
  };

  return (
    <div
      className="min-h-[280px] rounded-lg border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm"
      data-testid="calculator-result"
      aria-live="polite"
      aria-atomic="true"
    >
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-xl font-semibold text-brand-on-surface outline-none"
      >
        {mode === 'no_rule' ? 'Alcance no automatizado' : 'Alcance estimado'}
      </h2>

      {mode === 'no_rule' && noRuleMessage ? (
        <p className="mt-3 text-base text-muted" role="status">
          {noRuleMessage}
        </p>
      ) : null}

      {mode === 'success' && estimate ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Puntos de reconocimiento"
            value={`${estimate.boreholes} sondeo${estimate.boreholes === 1 ? '' : 's'}`}
          />
          {estimate.depthEstimate ? (
            <MetricCard label="Profundidad mínima" value={estimate.depthEstimate} />
          ) : null}
          {estimate.recommendedTests ? (
            <MetricCard
              label="Ensayos in situ y laboratorio"
              value={estimate.recommendedTests}
            />
          ) : null}
          {estimate.cteReference ? (
            <MetricCard label="Normativa de referencia" value={estimate.cteReference} />
          ) : null}
        </div>
      ) : null}

      <p className="mt-5 text-xs leading-relaxed text-muted">
        * Este cálculo es orientativo y no constituye una oferta vinculante. El alcance final debe
        ser validado por un técnico competente.
      </p>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-brand-on-surface">
          ¿Necesitas un estudio detallado?
        </p>
        <Link
          href={presupuestoHref}
          onClick={handleCtaClick}
          data-testid="calculator-cta-presupuesto"
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm px-6 py-3 text-base font-semibold sm:w-auto',
            'bg-brand-accent text-white transition-colors hover:bg-brand-accent/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
          )}
        >
          Solicitar presupuesto exacto
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
