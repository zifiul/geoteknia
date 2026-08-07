import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AuditEventDrawer } from '@/components/organisms/admin/audit/AuditEventDrawer';
import { AuditFiltersForm } from '@/components/organisms/admin/audit/AuditFilters';
import { AuditTable } from '@/components/organisms/admin/audit/AuditTable';
import { parseAuditFiltersFromSearchParams, uuidSchema } from '@/lib/admin/audit-filters-schema';
import {
  AuditLogNotFoundError,
  getAuditLogById,
  listAuditLogs,
} from '@/lib/admin/audit-queries';
import {
  listAuditActorFilterOptions,
  listAuditEntityFilterOptions,
} from '@/lib/admin/audit-filter-options';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';

export const metadata: Metadata = {
  title: 'Auditoría — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function buildQueryForPagination(
  filters: import('@/lib/admin/audit-filters-schema').AuditFilters,
  pageSize: number,
): Record<string, string> {
  const q: Record<string, string> = {};
  if (filters.action) q.action = filters.action;
  if (filters.userId) q.userId = filters.userId;
  if (filters.entityType && filters.entityId) {
    q.entityKey = `${filters.entityType}:${filters.entityId}`;
  }
  if (filters.from) q.from = filters.from.toISOString().slice(0, 10);
  if (filters.to) q.to = filters.to.toISOString().slice(0, 10);
  q.pageSize = String(pageSize);
  return q;
}

export default async function AdminAuditoriaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsed = parseAuditFiltersFromSearchParams(params);
  const filters = parsed.ok ? parsed.filters : parsed.filters;
  const fieldErrors = parsed.ok ? [] : parsed.fieldErrors;

  const eventRaw = firstParam(params.event);
  const eventId =
    eventRaw && uuidSchema.safeParse(eventRaw).success ? eventRaw : undefined;
  const eventIdInvalid = Boolean(eventRaw && !eventId);

  const [{ items, total, page, pageSize }, actorOptions, entityOptions] =
    await runWithPortalReadAccess(() =>
      Promise.all([
        listAuditLogs(filters),
        listAuditActorFilterOptions(),
        listAuditEntityFilterOptions(),
      ]),
    );

  let detail = null;
  if (eventId) {
    try {
      detail = await runWithPortalReadAccess(() => getAuditLogById(eventId));
    } catch (error) {
      if (error instanceof AuditLogNotFoundError) {
        notFound();
      }
      throw error;
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryForPagination = buildQueryForPagination(filters, pageSize);
  const listQuery = new URLSearchParams(queryForPagination);
  listQuery.set('page', String(page));
  listQuery.delete('event');
  const listQueryString = listQuery.toString();

  const hasActiveFilters =
    Boolean(filters.action) ||
    Boolean(filters.userId) ||
    Boolean(filters.entityType) ||
    Boolean(filters.entityId) ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1440px] space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-primary">Auditoría</h1>
        <p className="mt-1 text-sm text-brand-secondary">
          Registro append-only de acciones sensibles del portal (solo lectura)
        </p>
      </header>

      <AuditFiltersForm
        filters={filters}
        pageSize={pageSize}
        actorOptions={actorOptions}
        entityOptions={entityOptions}
        fieldErrors={
          eventIdInvalid
            ? [...fieldErrors, 'event: identificador de evento no válido']
            : fieldErrors
        }
      />

      {total === 0 ? (
        <section className="rounded-xl border border-dashed border-brand-primary/20 bg-brand-surface p-10 text-center">
          <p className="text-brand-secondary">
            No hay eventos que coincidan con los filtros.
          </p>
          {hasActiveFilters ? (
            <Link
              href="/admin/auditoria"
              className="mt-4 inline-block font-medium text-brand-accent hover:underline"
            >
              Restablecer filtros
            </Link>
          ) : null}
        </section>
      ) : (
        <AuditTable
          items={items}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          searchParams={queryForPagination}
        />
      )}

      {detail ? (
        <AuditEventDrawer event={detail} listQueryString={listQueryString} />
      ) : null}
    </main>
  );
}
