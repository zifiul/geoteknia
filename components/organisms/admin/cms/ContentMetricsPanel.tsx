import type { CmsWorkflowTotals } from '@/lib/admin/cms-workflow-counts';

type Props = {
  totals: CmsWorkflowTotals;
};

export function ContentMetricsPanel({ totals }: Props) {
  const cards = [
    { label: 'Borradores IA', value: totals.borradorIa },
    { label: 'En revisión', value: totals.enRevision },
    { label: 'Programados', value: totals.programados },
    { label: 'Publicados (7 d)', value: totals.publicadosRecientes },
  ];

  return (
    <section aria-labelledby="cms-metrics-heading" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <h2 id="cms-metrics-heading" className="sr-only">
        Métricas del flujo editorial
      </h2>
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-brand-primary/10 bg-brand-surface px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-primary">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}
