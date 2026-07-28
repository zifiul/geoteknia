'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { ActionBadge } from '@/components/organisms/admin/audit/ActionBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import { resolveAuditEntityHref } from '@/lib/admin/audit-entity-links';
import type { AuditEventDetail } from '@/lib/admin/audit-types';

type Props = {
  event: AuditEventDetail;
  listQueryString: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(value);
}

function formatMetadata(metadata: unknown): string {
  if (metadata === null || metadata === undefined) {
    return '—';
  }
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}

export function AuditEventDrawer({ event, listQueryString }: Props) {
  const router = useRouter();
  const closeHref =
    listQueryString.length > 0
      ? `/admin/auditoria?${listQueryString}`
      : '/admin/auditoria';

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        router.push(closeHref);
      }
    },
    [closeHref, router],
  );

  const entityHref = resolveAuditEntityHref(
    event.entityType,
    event.entityId,
  );

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-y-0 right-0 left-auto top-0 flex h-full max-h-none w-full max-w-lg translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-none border-l border-brand-secondary/20 p-0 shadow-xl"
        aria-describedby="audit-event-description"
      >
        <div className="border-b border-brand-primary/10 px-6 py-5">
          <DialogTitle>Detalle del evento</DialogTitle>
          <DialogDescription id="audit-event-description">
            {formatDate(event.createdAt)}
          </DialogDescription>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5 text-sm">
          <dl className="grid gap-3">
            <div>
              <dt className="font-medium text-brand-secondary">Actor</dt>
              <dd className="text-brand-primary">
                {event.user?.fullName ?? 'Sistema'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-brand-secondary">Acción</dt>
              <dd className="mt-1">
                <ActionBadge action={event.action} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-brand-secondary">Entidad</dt>
              <dd className="font-mono text-xs">
                {event.entityType ?? '—'}
                {event.entityId ? ` · ${event.entityId}` : ''}
              </dd>
              {entityHref ? (
                <dd className="mt-2">
                  <Link
                    href={entityHref}
                    className="font-medium text-brand-accent hover:underline"
                  >
                    Abrir recurso
                  </Link>
                </dd>
              ) : event.entityType &&
                event.entityId &&
                !entityHref ? (
                <dd className="mt-1 text-xs text-brand-secondary">
                  Enlace no disponible para este tipo de entidad (editor CMS
                  pendiente).
                </dd>
              ) : null}
            </div>
            <div>
              <dt className="font-medium text-brand-secondary">IP</dt>
              <dd className="font-mono text-xs">{event.ipAddress ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-brand-secondary">User agent</dt>
              <dd className="break-all text-xs text-brand-on-surface">
                {event.userAgent ?? '—'}
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-brand-primary">
              Metadata
            </h3>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-brand-neutral/50 p-3 font-mono text-xs text-brand-on-surface">
              {formatMetadata(event.metadata)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
