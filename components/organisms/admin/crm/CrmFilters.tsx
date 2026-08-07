import type { PipelineView } from '@/lib/projects/pipeline-view';
import type { CrmFilterOptions } from '@/lib/projects/crm-filter-options';
import type { ProjectFilters } from '@/lib/projects/project-filters-schema';

type Props = {
  filters: ProjectFilters;
  options: CrmFilterOptions;
  pageSize: number;
  showTechnicianFilter: boolean;
  view: PipelineView;
};

export function CrmFilters({ filters, options, pageSize, showTechnicianFilter, view }: Props) {
  return (
    <section
      aria-labelledby="crm-filters-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
    >
      <h2 id="crm-filters-heading" className="text-sm font-semibold text-brand-primary">
        Filtros
      </h2>
      <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block text-sm text-brand-secondary">
          Estado
          <select
            name="stateSlug"
            defaultValue={filters.stateSlug ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {options.states.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {showTechnicianFilter ? (
          <label className="block text-sm text-brand-secondary">
            Técnico
            <select
              name="technicianId"
              defaultValue={filters.technicianId ?? ''}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {options.technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm text-brand-secondary">
          Servicio
          <select
            name="serviceSlug"
            defaultValue={filters.serviceSlug ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {options.services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Provincia
          <select
            name="provinceSlug"
            defaultValue={filters.provinceSlug ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {options.provinces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Desde
          <input
            name="from"
            type="date"
            defaultValue={filters.from ? filters.from.toISOString().slice(0, 10) : ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm text-brand-secondary">
          Hasta
          <input
            name="to"
            type="date"
            defaultValue={filters.to ? filters.to.toISOString().slice(0, 10) : ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
        </label>
        <input type="hidden" name="pageSize" value={String(pageSize)} />
        {view === 'list' ? <input type="hidden" name="view" value="list" /> : null}
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-6">
          <button
            type="submit"
            className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 cursor-pointer"
          >
            Aplicar filtros
          </button>
          <a
            href="/admin/proyectos"
            className="min-h-11 inline-flex items-center rounded-md border border-brand-secondary/30 px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-neutral/60"
          >
            Limpiar filtros
          </a>
        </div>
      </form>
    </section>
  );
}
