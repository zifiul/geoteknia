import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CrmEmptyState } from '@/components/organisms/admin/crm/CrmEmptyState';
import { CrmFilters } from '@/components/organisms/admin/crm/CrmFilters';
import { buildPageQuery, CrmPagination } from '@/components/organisms/admin/crm/CrmPagination';
import { MetricsPanel } from '@/components/organisms/admin/crm/MetricsPanel';
import { PipelineBoard } from '@/components/organisms/admin/crm/PipelineBoard';
import { PipelineViewToggle } from '@/components/organisms/admin/crm/PipelineViewToggle';
import { ProjectList } from '@/components/organisms/admin/crm/ProjectList';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { ROLES, resolvePermissionCodesForRole } from '@/lib/auth/permissions';
import { getPortalSession } from '@/lib/auth/session';
import type { RoleName } from '@prisma/client';
import {
  getPipelineMetrics,
  groupProjectsByState,
  listPipelineBoardStates,
  listPipelineFilterOptions,
  listProjects,
  parseProjectFiltersFromSearchParams,
  firstSearchParam,
  resolvePipelineView,
} from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Proyectos — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function hasActiveProjectFilters(
  filters: ReturnType<typeof parseProjectFiltersFromSearchParams>,
): boolean {
  return Boolean(
    filters.stateSlug ||
      filters.technicianId ||
      filters.serviceSlug ||
      filters.provinceSlug ||
      filters.from ||
      filters.to ||
      filters.slaOverdue,
  );
}

export default async function AdminProyectosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProjectFiltersFromSearchParams(params);

  return runWithPortalReadAccess(async () => {
    const user = await getPortalSession();
    const roleMeta = ROLES.find((r) => r.name === user.roleName);
    const view = resolvePipelineView(
      user.roleName,
      firstSearchParam(params.view),
    );
    const isTechnician = user.roleName === 'tecnico';
    const canChangeState =
      !isTechnician &&
      resolvePermissionCodesForRole(user.roleName as RoleName).includes(
        'projects.update',
      );
    const showMetrics = !isTechnician;
    const showBoardToggle = !isTechnician;

    const [listResult, metrics, boardStates, filterOptions] = await Promise.all([
      listProjects(filters),
      showMetrics ? getPipelineMetrics(filters) : Promise.resolve(null),
      view === 'board' ? listPipelineBoardStates() : Promise.resolve([]),
      listPipelineFilterOptions(),
    ]);

    const { items, total, page, pageSize } = listResult;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const columns =
      view === 'board'
        ? groupProjectsByState(boardStates, items)
        : [];
    const stateOptions = filterOptions.states;

    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-col gap-4 border-b border-brand-primary/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              {isTechnician ? 'Mis proyectos' : (roleMeta?.label ?? user.roleName)}
            </p>
            <h1 className="text-headline-sm font-semibold text-brand-primary">
              {isTechnician ? 'Mis proyectos' : 'Pipeline de proyectos'}
            </h1>
            <p
              className="text-body-md text-brand-secondary"
              aria-live="polite"
              aria-atomic="true"
              data-testid="crm-result-count"
            >
              {total} proyecto{total === 1 ? '' : 's'}
            </p>
          </div>
          <Suspense fallback={null}>
            <PipelineViewToggle view={view} showBoardToggle={showBoardToggle} />
          </Suspense>
        </header>

        {showMetrics && metrics ? <MetricsPanel metrics={metrics} /> : null}

        <CrmFilters
          filters={filters}
          options={filterOptions}
          pageSize={pageSize}
          showTechnicianFilter={!isTechnician}
          view={view}
        />

        {items.length === 0 ? (
          <CrmEmptyState hasActiveFilters={hasActiveProjectFilters(filters)} />
        ) : view === 'board' ? (
          <PipelineBoard
            columns={columns}
            allStates={stateOptions}
            canChangeState={canChangeState}
          />
        ) : (
          <ProjectList
            items={items}
            allStates={stateOptions}
            canChangeState={canChangeState}
          />
        )}

        {items.length > 0 ? (
          <CrmPagination
            page={page}
            totalPages={totalPages}
            prevHref={
              page > 1 ? `?${buildPageQuery(params, page - 1, pageSize)}` : undefined
            }
            nextHref={
              page < totalPages
                ? `?${buildPageQuery(params, page + 1, pageSize)}`
                : undefined
            }
          />
        ) : null}
      </div>
    );
  });
}
