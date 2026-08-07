import type { UserFilters } from '@/lib/admin/user-filters-schema';
import { ROLES } from '@/lib/auth/permissions';

type Props = {
  filters: UserFilters;
  pageSize: number;
};

export function UserFiltersForm({ filters, pageSize }: Props) {
  return (
    <section
      aria-labelledby="user-filters-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
    >
      <h2 id="user-filters-heading" className="text-sm font-semibold text-brand-primary">
        Filtros
      </h2>
      <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-brand-secondary">
          Buscar
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Nombre o email"
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm text-brand-secondary">
          Rol
          <select
            name="role"
            defaultValue={filters.role ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {ROLES.map((role) => (
              <option key={role.name} value={role.name}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Estado
          <select
            name="active"
            defaultValue={
              filters.active === undefined ? '' : filters.active ? 'true' : 'false'
            }
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
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
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 cursor-pointer"
          >
            Aplicar filtros
          </button>
        </div>
      </form>
    </section>
  );
}
