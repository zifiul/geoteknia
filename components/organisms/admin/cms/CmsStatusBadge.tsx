import type { WorkflowStatus } from '@prisma/client';

import { WORKFLOW_STATUS_LABELS } from '@/lib/admin/cms-workflow-labels';

type Props = {
  status: WorkflowStatus;
};

const STATUS_STYLES: Record<WorkflowStatus, string> = {
  borrador_ia:
    'bg-violet-100 text-violet-900 ring-1 ring-inset ring-violet-200',
  en_revision:
    'bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-200',
  aprobado: 'bg-sky-100 text-sky-950 ring-1 ring-inset ring-sky-200',
  publicado:
    'bg-emerald-100 text-emerald-950 ring-1 ring-inset ring-emerald-200',
  rechazado: 'bg-red-100 text-red-950 ring-1 ring-inset ring-red-200',
  despublicado:
    'bg-neutral-200 text-neutral-800 ring-1 ring-inset ring-neutral-300',
};

export function CmsStatusBadge({ status }: Props) {
  const label = WORKFLOW_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}
