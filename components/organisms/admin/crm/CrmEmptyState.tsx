import Link from 'next/link';

type Props = {
  hasActiveFilters: boolean;
};

export function CrmEmptyState({ hasActiveFilters }: Props) {
  return (
    <div
      className="rounded-xl border border-dashed border-brand-secondary/30 bg-brand-neutral/30 px-6 py-12 text-center"
      data-testid="crm-pipeline-empty"
    >
      <p className="text-lg font-semibold text-brand-primary">No hay proyectos</p>
      <p className="mt-2 text-sm text-brand-secondary">
        {hasActiveFilters
          ? 'Ningún proyecto coincide con los filtros aplicados.'
          : 'Aún no hay proyectos en el pipeline.'}
      </p>
      {hasActiveFilters ? (
        <Link
          href="/admin/proyectos"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90"
        >
          Restablecer filtros
        </Link>
      ) : null}
    </div>
  );
}
