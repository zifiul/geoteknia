import type { Metadata } from 'next';
import Link from 'next/link';

import { UserFiltersForm } from '@/components/organisms/admin/users/UserFilters';
import { UsersTable } from '@/components/organisms/admin/users/UsersTable';
import { parseUserFiltersFromSearchParams } from '@/lib/admin/user-filters-schema';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { listUsers } from '@/lib/admin/users-queries';

export const metadata: Metadata = {
  title: 'Usuarios — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseUserFiltersFromSearchParams(params);

  const { items, total, page, pageSize } = await runWithPortalReadAccess(() =>
    listUsers(filters),
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const queryForPagination: Record<string, string> = {};
  if (filters.q) queryForPagination.q = filters.q;
  if (filters.role) queryForPagination.role = filters.role;
  if (filters.active !== undefined) {
    queryForPagination.active = String(filters.active);
  }
  queryForPagination.pageSize = String(pageSize);

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">Usuarios</h1>
          <p className="mt-1 text-sm text-brand-secondary">
            Gestión de cuentas internas del portal
          </p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="inline-flex min-h-11 items-center rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90"
        >
          Nuevo usuario
        </Link>
      </header>

      <UserFiltersForm filters={filters} pageSize={pageSize} />

      {total === 0 ? (
        <section className="rounded-xl border border-dashed border-brand-primary/20 bg-brand-surface p-10 text-center">
          <p className="text-brand-secondary">No hay usuarios que coincidan con los filtros.</p>
          <Link
            href="/admin/usuarios/nuevo"
            className="mt-4 inline-block font-medium text-brand-accent hover:underline"
          >
            Crear usuario
          </Link>
        </section>
      ) : (
        <UsersTable
          items={items}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          searchParams={queryForPagination}
        />
      )}
    </main>
  );
}
