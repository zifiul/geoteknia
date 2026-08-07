'use client';

import { AuditAction } from '@prisma/client';

import { AUDIT_ACTION_LABELS } from '@/lib/admin/audit-labels';
import type { AuditFilters } from '@/lib/admin/audit-filters-schema';
import type {
  AuditActorFilterOption,
  AuditEntityFilterOption,
} from '@/lib/admin/audit-types';

type Props = {
  filters: AuditFilters;
  pageSize: number;
  fieldErrors?: string[];
  actorOptions: AuditActorFilterOption[];
  entityOptions: AuditEntityFilterOption[];
};

function formatDateInput(value: Date | undefined): string {
  if (!value) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AuditFiltersForm({
  filters,
  pageSize,
  fieldErrors = [],
  actorOptions,
  entityOptions,
}: Props) {
  const actions = Object.values(AuditAction);
  const selectedEntityKey =
    filters.entityType && filters.entityId
      ? `${filters.entityType}:${filters.entityId}`
      : '';

  return (
    <section
      aria-labelledby="audit-filters-heading"
      className="min-w-0 max-w-full rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
    >
      <h2
        id="audit-filters-heading"
        className="text-sm font-semibold text-brand-primary"
      >
        Filtros
      </h2>
      {fieldErrors.length > 0 ? (
        <ul
          className="mt-2 list-disc pl-5 text-sm text-red-700"
          role="alert"
        >
          {fieldErrors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}
      <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm text-brand-secondary">
          Acción
          <select
            name="action"
            defaultValue={filters.action ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {AUDIT_ACTION_LABELS[action]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Usuario
          <select
            name="userId"
            defaultValue={filters.userId ?? ''}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {actorOptions.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Entidad
          <select
            name="entityKey"
            defaultValue={selectedEntityKey}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {entityOptions.map((entity) => (
              <option key={entity.key} value={entity.key}>
                {entity.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-brand-secondary">
          Desde
          <input
            type="date"
            name="from"
            defaultValue={formatDateInput(filters.from)}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm text-brand-secondary">
          Hasta
          <input
            type="date"
            name="to"
            defaultValue={formatDateInput(filters.to)}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
          />
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
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 cursor-pointer"
          >
            Aplicar filtros
          </button>
          <a
            href="/admin/auditoria"
            className="rounded-md border border-brand-secondary/30 px-4 py-2 text-sm font-medium hover:bg-brand-neutral"
          >
            Restablecer
          </a>
        </div>
      </form>
    </section>
  );
}
