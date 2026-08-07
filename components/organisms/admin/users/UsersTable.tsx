import Link from 'next/link';

import type { UserListItem } from '@/lib/admin/users-queries';
import { UserStatusBadge } from '@/components/organisms/admin/users/UserStatusBadge';

type Props = {
  items: UserListItem[];
  page: number;
  totalPages: number;
  pageSize: number;
  searchParams: Record<string, string>;
};

function formatDate(value: Date | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

export function UsersTable({ items, page, totalPages, pageSize, searchParams }: Props) {
  const baseQuery = new URLSearchParams(searchParams);

  return (
    <section aria-labelledby="users-table-heading" className="mt-6 min-w-0 w-full">
      <h2 id="users-table-heading" className="sr-only">
        Listado de usuarios
      </h2>

      <ul className="space-y-3 md:hidden">
        {items.map((user) => (
          <li
            key={user.id}
            className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-brand-primary">{user.fullName}</p>
              <UserStatusBadge
                isActive={user.isActive}
                twofaEnabled={user.twofaEnabled}
              />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Email</dt>
                <dd className="break-all text-brand-on-surface">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Rol</dt>
                <dd className="text-brand-on-surface">{user.role.label}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-brand-secondary">Último acceso</dt>
                <dd className="tabular-nums text-brand-secondary">
                  {formatDate(user.lastLoginAt)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/usuarios/${user.id}`}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-accent hover:underline"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm md:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-brand-primary/10 bg-brand-neutral/40 text-brand-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Rol
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Último acceso
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id} className="border-b border-brand-primary/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-primary">
                  {user.fullName}
                </td>
                <td className="px-4 py-3 text-brand-on-surface">{user.email}</td>
                <td className="px-4 py-3">{user.role.label}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge
                    isActive={user.isActive}
                    twofaEnabled={user.twofaEnabled}
                  />
                </td>
                <td className="px-4 py-3 tabular-nums text-brand-secondary">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/usuarios/${user.id}`}
                    className="font-medium text-brand-accent hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"
        aria-label="Paginación de usuarios"
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
      href={`/admin/usuarios?${q.toString()}`}
      className="rounded-md border border-brand-secondary/30 px-3 py-1.5 hover:bg-brand-neutral"
    >
      {label}
    </Link>
  );
}
