import Link from 'next/link';

import type { DashboardKpi } from '@/lib/admin/dashboard-metrics';

type Props = {
  kpis: DashboardKpi[];
};

export function KpiGrid({ kpis }: Props) {
  if (kpis.length === 0) {
    return (
      <section
        aria-labelledby="kpi-heading"
        className="rounded-xl border border-brand-primary/10 bg-brand-surface p-6 shadow-sm"
      >
        <h2 id="kpi-heading" className="text-lg font-semibold text-brand-primary">
          Indicadores
        </h2>
        <p className="mt-2 text-sm text-brand-secondary">
          No hay indicadores para tu rol en este periodo.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">
        Indicadores clave
      </h2>
      <ul
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-live="polite"
      >
        {kpis.map((kpi) => (
          <li key={kpi.id}>
            <KpiCard kpi={kpi} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const body = (
    <>
      <p className="text-sm font-medium text-brand-secondary">{kpi.label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-primary">
        {kpi.value}
      </p>
      {kpi.detail ? (
        <p className="mt-1 text-xs text-brand-secondary">{kpi.detail}</p>
      ) : null}
    </>
  );

  const className =
    'flex min-h-[7.5rem] flex-col justify-center rounded-xl border border-brand-primary/10 bg-brand-surface p-5 shadow-sm transition-shadow hover:shadow-md';

  if (kpi.href) {
    return (
      <Link
        href={kpi.href}
        className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
      >
        {body}
        <span className="mt-2 text-xs font-medium text-brand-accent">Ver detalle</span>
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
