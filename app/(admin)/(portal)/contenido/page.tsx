import type { Metadata } from 'next';

import { ContentFiltersForm } from '@/components/organisms/admin/cms/ContentFilters';
import { ContentMetricsPanel } from '@/components/organisms/admin/cms/ContentMetricsPanel';
import { ContentTable } from '@/components/organisms/admin/cms/ContentTable';
import { NewContentMenu } from '@/components/organisms/admin/cms/NewContentMenu';
import { listCmsContent } from '@/lib/admin/cms-content-queries';
import { parseCmsFiltersFromSearchParams } from '@/lib/admin/cms-filters-schema';
import { getCmsWorkflowTotals } from '@/lib/admin/cms-workflow-counts';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { can } from '@/lib/auth/rbac';
import { getPortalSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Contenido — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContenidoListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseCmsFiltersFromSearchParams(params);

  const session = await runWithPortalReadAccess(() => getPortalSession());
  const canCreate = can(session, 'content.create');
  const canEdit = can(session, 'content.update');

  const [{ items, total, page, pageSize }, totals] = await Promise.all([
    runWithPortalReadAccess(() => listCmsContent(filters)),
    runWithPortalReadAccess(() => getCmsWorkflowTotals()),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const queryForPagination: Record<string, string> = {};
  if (filters.type) queryForPagination.type = filters.type;
  if (filters.status) queryForPagination.status = filters.status;
  if (filters.silo) queryForPagination.silo = filters.silo;
  queryForPagination.pageSize = String(pageSize);

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1440px] space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">Contenido</h1>
          <p className="mt-1 text-sm text-brand-secondary">
            {total} elemento{total === 1 ? '' : 's'} editorial
            {total > 0 ? ` · página ${page} de ${totalPages}` : ''}
          </p>
        </div>
        <NewContentMenu canCreate={canCreate} />
      </header>

      <ContentMetricsPanel totals={totals} />

      <ContentFiltersForm filters={filters} pageSize={pageSize} />

      {total === 0 ? (
        <section className="rounded-xl border border-dashed border-brand-primary/20 bg-brand-surface p-10 text-center">
          <p className="text-brand-secondary">
            No hay contenido que coincida con los filtros seleccionados.
          </p>
          {canCreate ? (
            <p className="mt-4 text-sm text-brand-secondary">
              Usa &quot;Crear contenido&quot; para añadir un borrador editorial.
            </p>
          ) : null}
        </section>
      ) : (
        <ContentTable
          items={items}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          searchParams={queryForPagination}
          canEdit={canEdit}
        />
      )}
    </main>
  );
}
