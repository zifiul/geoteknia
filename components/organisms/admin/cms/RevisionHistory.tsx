'use client';

import type { WorkflowStatus } from '@prisma/client';

import { WORKFLOW_STATUS_LABELS } from '@/lib/admin/cms-workflow-labels';
import { CmsStatusBadge } from '@/components/organisms/admin/cms/CmsStatusBadge';

export type RevisionHistoryItem = {
  versionNumber: number;
  workflowStatusAt: WorkflowStatus;
  editorName: string;
  changeSummary: string | null;
  createdAt: string;
};

type Props = {
  revisions: RevisionHistoryItem[];
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function RevisionHistory({ revisions }: Props) {
  return (
    <section
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4"
      aria-labelledby="revision-history-heading"
      data-testid="cms-revision-history"
    >
      <h2
        id="revision-history-heading"
        className="font-semibold text-brand-primary"
      >
        Historial de versiones
      </h2>
      {revisions.length === 0 ? (
        <p className="mt-3 text-sm text-brand-secondary">
          Aún no hay revisiones registradas.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-brand-primary/10">
          {revisions.map((rev) => (
            <li key={rev.versionNumber} className="py-3 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-medium text-brand-primary">
                  v{rev.versionNumber}
                </span>
                <CmsStatusBadge status={rev.workflowStatusAt} />
              </div>
              <p className="mt-1 text-sm text-brand-secondary">
                {rev.editorName} · {formatDate(rev.createdAt)}
              </p>
              <p className="text-xs text-brand-secondary/80">
                Estado: {WORKFLOW_STATUS_LABELS[rev.workflowStatusAt]}
              </p>
              {rev.changeSummary ? (
                <p className="mt-1 text-sm text-brand-accent">{rev.changeSummary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
