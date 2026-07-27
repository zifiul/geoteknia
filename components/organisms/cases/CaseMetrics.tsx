export type CaseMetricsProps = {
  boreholesCount: number | null;
  metersDrilled: number | null;
  testsSummary: string | null;
  projectYear: number | null;
};

function formatMeters(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function CaseMetrics({
  boreholesCount,
  metersDrilled,
  testsSummary,
  projectYear,
}: CaseMetricsProps) {
  const hasBoreholes = boreholesCount != null && boreholesCount > 0;
  const hasMeters = metersDrilled != null && metersDrilled > 0;
  const hasTests = testsSummary?.trim();
  const hasYear = projectYear != null;

  if (!hasBoreholes && !hasMeters && !hasTests && !hasYear) {
    return null;
  }

  return (
    <section
      className="border-y border-brand-secondary/10 bg-brand-neutral/30 py-8"
      aria-labelledby="case-metrics-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 id="case-metrics-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">
          Volumen de obra
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasYear ? (
            <li className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-4">
              <p className="text-sm text-muted">Año de proyecto</p>
              <p className="mt-1 font-display text-2xl font-semibold text-brand-on-surface">
                {projectYear}
              </p>
            </li>
          ) : null}
          {hasBoreholes ? (
            <li className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-4">
              <p className="text-sm text-muted">Sondeos</p>
              <p className="mt-1 font-display text-2xl font-semibold text-brand-on-surface">
                {boreholesCount}
                <span className="ml-1 text-base font-normal text-muted">
                  {boreholesCount === 1 ? 'sondeo' : 'sondeos'}
                </span>
              </p>
            </li>
          ) : null}
          {hasMeters ? (
            <li className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-4">
              <p className="text-sm text-muted">Metros perforados</p>
              <p className="mt-1 font-display text-2xl font-semibold text-brand-on-surface">
                {formatMeters(metersDrilled!)}
                <span className="ml-1 text-base font-normal text-muted">m</span>
              </p>
            </li>
          ) : null}
          {hasTests ? (
            <li className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-muted">Ensayos</p>
              <p className="mt-1 text-base text-brand-on-surface">{testsSummary!.trim()}</p>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
