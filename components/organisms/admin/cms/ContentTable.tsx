import Link from 'next/link';

import { CmsStatusBadge } from '@/components/organisms/admin/cms/CmsStatusBadge';
import type { CmsContentListItem } from '@/lib/admin/cms-content-queries';

type Props = {
  items: CmsContentListItem[];
  page: number;
  totalPages: number;
  pageSize: number;
  searchParams: Record<string, string>;
  canEdit: boolean;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

export function ContentTable({
  items,
  page,
  totalPages,
  pageSize,
  searchParams,
  canEdit,
}: Props) {
  const baseQuery = new URLSearchParams(searchParams);

  return (
    <section aria-labelledby="cms-table-heading" className="mt-6 min-w-0 w-full">
      <h2 id="cms-table-heading" className="sr-only">
        Listado de contenido editorial
      </h2>

      <ul className="space-y-3 md:hidden">
        {items.map((row) => (
          <li
            key={`${row.contentType}-${row.id}`}
            className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium break-words text-brand-primary">{row.title}</p>
              <CmsStatusBadge status={row.workflowStatus} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Tipo</dt>
                <dd className="text-brand-on-surface">{row.typeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Silo</dt>
                <dd className="text-brand-on-surface">{row.siloLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Autor</dt>
                <dd className="text-brand-on-surface">{row.authorName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Actualizado</dt>
                <dd className="tabular-nums text-brand-secondary">
                  {formatDate(row.updatedAt)}
                </dd>
              </div>
            </dl>
            {canEdit ? (
              <Link
                href={row.editHref}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-accent hover:underline"
              >
                Editar
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="hidden w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm md:block">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-brand-primary/10 bg-brand-neutral/40 text-brand-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Título
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Silo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Autor
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Actualizado
              </th>
              {canEdit ? (
                <th scope="col" className="px-4 py-3 font-semibold">
                  <span className="sr-only">Acciones</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={`${row.contentType}-${row.id}`}
                className="border-b border-brand-primary/5 last:border-0"
              >
                <td className="max-w-xs px-4 py-3 font-medium text-brand-primary">
                  <span className="line-clamp-2">{row.title}</span>
                </td>
                <td className="px-4 py-3 text-brand-on-surface">{row.typeLabel}</td>
                <td className="px-4 py-3 text-brand-on-surface">{row.siloLabel}</td>
                <td className="px-4 py-3">
                  <CmsStatusBadge status={row.workflowStatus} />
                </td>
                <td className="px-4 py-3 text-brand-on-surface">
                  {row.authorName ?? '—'}
                </td>
                <td className="px-4 py-3 tabular-nums text-brand-secondary">
                  {formatDate(row.updatedAt)}
                </td>
                {canEdit ? (
                  <td className="px-4 py-3">
                    <Link
                      href={row.editHref}
                      className="font-medium text-brand-accent hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"
        aria-label="Paginación de contenido"
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
  return (
    <Link
      href={`?${q.toString()}`}
      className="min-h-11 rounded-md border border-brand-primary/20 px-3 py-2 font-medium text-brand-accent hover:bg-brand-neutral/40"
    >
      {label}
    </Link>
  );
}
