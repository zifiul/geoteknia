import type { CmsFilters } from '@/lib/admin/cms-filters-schema';
import {
  CMS_CONTENT_TYPE_CATALOG,
  CMS_SILO_LABELS,
  CMS_SILOS,
} from '@/lib/admin/cms-content-types';
import { WORKFLOW_STATUS_OPTIONS } from '@/lib/admin/cms-workflow-labels';

type Props = {
  filters: CmsFilters;
  pageSize: number;
};

export function ContentFiltersForm({ filters, pageSize }: Props) {
  return (
    <section
      aria-labelledby="cms-filters-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
    >
      <h2 id="cms-filters-heading" className="text-sm font-semibold text-brand-primary">
        Filtros
      </h2>
      <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block text-sm text-brand-secondary">
          Tipo
          <select
            name="type"
            defaultValue={filters.type ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {CMS_CONTENT_TYPE_CATALOG.map((row) => (
              <option key={row.type} value={row.type}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Estado
          <select
            name="status"
            defaultValue={filters.status ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {WORKFLOW_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Silo
          <select
            name="silo"
            defaultValue={filters.silo ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {CMS_SILOS.map((silo) => (
              <option key={silo} value={silo}>
                {CMS_SILO_LABELS[silo]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Por página
          <select
            name="pageSize"
            defaultValue={String(pageSize)}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90"
          >
            Aplicar filtros
          </button>
        </div>
      </form>
    </section>
  );
}
