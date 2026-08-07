import Link from 'next/link';

import { ActionBadge } from '@/components/organisms/admin/audit/ActionBadge';
import { maskAuditIpForList } from '@/lib/admin/audit-ip';
import type { AuditLogListItem } from '@/lib/admin/audit-queries';

type Props = {
  items: AuditLogListItem[];
  page: number;
  totalPages: number;
  pageSize: number;
  searchParams: Record<string, string>;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function buildEventHref(
  eventId: string,
  baseQuery: URLSearchParams,
): string {
  const q = new URLSearchParams(baseQuery);
  q.set('event', eventId);
  q.delete('page');
  return `/admin/auditoria?${q.toString()}`;
}

function formatEntity(
  entityType: string | null,
  entityId: string | null,
): string {
  if (!entityType) return '—';
  if (!entityId) return entityType;
  return `${entityType} · ${shortId(entityId)}`;
}

export function AuditTable({
  items,
  page,
  totalPages,
  pageSize,
  searchParams,
}: Props) {
  const baseQuery = new URLSearchParams(searchParams);

  return (
    <section aria-labelledby="audit-table-heading" className="mt-6 min-w-0 w-full">
      <h2 id="audit-table-heading" className="sr-only">
        Registro de auditoría
      </h2>

      {/* Móvil: tarjetas (evita que la tabla ensanche la página) */}
      <ul className="space-y-3 md:hidden">
        {items.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs tabular-nums text-brand-secondary">
                {formatDate(row.createdAt)}
              </p>
              <ActionBadge action={row.action} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Actor</dt>
                <dd className="text-brand-primary">
                  {row.user?.fullName ?? 'Sistema'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Entidad</dt>
                <dd className="break-all font-mono text-xs text-brand-on-surface">
                  {formatEntity(row.entityType, row.entityId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">IP</dt>
                <dd className="font-mono text-xs text-brand-secondary">
                  {maskAuditIpForList(row.ipAddress)}
                </dd>
              </div>
            </dl>
            <Link
              href={buildEventHref(row.id, baseQuery)}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-accent hover:underline"
            >
              Ver detalle
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: tabla con scroll interno */}
      <div className="hidden w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm md:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-brand-primary/10 bg-brand-neutral/40 text-brand-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Actor
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Acción
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Entidad
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                IP (resumen)
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                <span className="sr-only">Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-brand-primary/5 last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-brand-secondary">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-4 py-3 text-brand-primary">
                  {row.user?.fullName ?? 'Sistema'}
                </td>
                <td className="px-4 py-3">
                  <ActionBadge action={row.action} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-on-surface">
                  {formatEntity(row.entityType, row.entityId)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-secondary">
                  {maskAuditIpForList(row.ipAddress)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={buildEventHref(row.id, baseQuery)}
                    className="font-medium text-brand-accent hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"
        aria-label="Paginación de auditoría"
      >
        <p className="text-brand-secondary">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <PaginationLink
              page={page - 1}
              pageSize={pageSize}
              baseQuery={baseQuery}
              label="Anterior"
            />
          ) : null}
          {page < totalPages ? (
            <PaginationLink
              page={page + 1}
              pageSize={pageSize}
              baseQuery={baseQuery}
              label="Siguiente"
            />
          ) : null}
        </div>
      </nav>
    </section>
  );
}

function PaginationLink({
  page,
  pageSize,
  baseQuery,
  label,
}: {
  page: number;
  pageSize: number;
  baseQuery: URLSearchParams;
  label: string;
}) {
  const q = new URLSearchParams(baseQuery);
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  q.delete('event');
  return (
    <Link
      href={`/admin/auditoria?${q.toString()}`}
      className="rounded-md border border-brand-secondary/30 px-3 py-1.5 hover:bg-brand-neutral"
    >
      {label}
    </Link>
  );
}
