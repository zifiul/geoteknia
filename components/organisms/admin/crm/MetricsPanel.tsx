import type { PipelineMetrics } from '@/lib/projects/metrics';

type Props = {
  metrics: PipelineMetrics;
};

export function MetricsPanel({ metrics }: Props) {
  const qualification =
    metrics.qualificationRate === null
      ? '—'
      : `${(metrics.qualificationRate * 100).toFixed(1)} %`;
  const avgResponse =
    metrics.avgFirstResponseHours === null
      ? '—'
      : `${metrics.avgFirstResponseHours.toFixed(1)} h`;

  return (
    <section aria-labelledby="crm-metrics-heading" className="space-y-4">
      <h2 id="crm-metrics-heading" className="text-sm font-semibold text-brand-primary">
        Métricas del pipeline
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-primary/10 bg-brand-surface px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
            Cualificación
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-primary">
            {qualification}
          </p>
        </div>
        <div className="rounded-xl border border-brand-primary/10 bg-brand-surface px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
            1.ª respuesta (media)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-primary">
            {avgResponse}
          </p>
        </div>
        <div className="rounded-xl border border-brand-primary/10 bg-brand-surface px-4 py-3 shadow-sm lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
            Por servicio
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-on-surface">
            {metrics.byService.length === 0 ? (
              <li className="text-muted">Sin datos</li>
            ) : (
              metrics.byService.map((row) => (
                <li key={row.serviceId ?? 'none'}>
                  <span className="font-medium">{row.label}</span>: {row.count}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-brand-primary/10 bg-brand-surface px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
          Por provincia
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-on-surface">
          {metrics.byProvince.length === 0 ? (
            <li className="text-muted">Sin datos</li>
          ) : (
            metrics.byProvince.map((row) => (
              <li key={row.provinceId ?? 'none'}>
                <span className="font-medium">{row.label}</span>: {row.count}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
