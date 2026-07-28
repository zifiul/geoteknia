import { WorkflowStatus } from '@prisma/client';

/** Copia cliente del grafo en `lib/content/workflow.ts` (GTK-39). */
export const EDITORIAL_TRANSITIONS_UI: Record<
  WorkflowStatus,
  readonly WorkflowStatus[]
> = {
  [WorkflowStatus.borrador_ia]: [WorkflowStatus.en_revision],
  [WorkflowStatus.en_revision]: [
    WorkflowStatus.aprobado,
    WorkflowStatus.rechazado,
  ],
  [WorkflowStatus.aprobado]: [WorkflowStatus.publicado],
  [WorkflowStatus.publicado]: [WorkflowStatus.despublicado],
  [WorkflowStatus.rechazado]: [WorkflowStatus.borrador_ia],
  [WorkflowStatus.despublicado]: [],
};

export type WorkflowActionKind =
  | 'submit_review'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'unpublish'
  | 'regenerate_draft'
  | 'schedule';

export type WorkflowActionDescriptor = {
  kind: WorkflowActionKind;
  targetStatus: WorkflowStatus;
  label: string;
  permission: 'content.update' | 'content.publish';
  variant: 'primary' | 'secondary' | 'danger';
};

const ACTION_META: Record<
  WorkflowActionKind,
  Omit<WorkflowActionDescriptor, 'kind' | 'targetStatus' | 'permission'> & {
    permission: 'content.update' | 'content.publish';
  }
> = {
  submit_review: {
    label: 'Enviar a revisión',
    permission: 'content.update',
    variant: 'primary',
  },
  approve: {
    label: 'Aprobar',
    permission: 'content.update',
    variant: 'primary',
  },
  reject: {
    label: 'Rechazar',
    permission: 'content.update',
    variant: 'danger',
  },
  publish: {
    label: 'Publicar',
    permission: 'content.publish',
    variant: 'primary',
  },
  unpublish: {
    label: 'Despublicar',
    permission: 'content.publish',
    variant: 'danger',
  },
  regenerate_draft: {
    label: 'Volver a borrador IA',
    permission: 'content.update',
    variant: 'secondary',
  },
  schedule: {
    label: 'Programar publicación',
    permission: 'content.publish',
    variant: 'secondary',
  },
};

function kindForTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
): WorkflowActionKind | null {
  if (from === WorkflowStatus.borrador_ia && to === WorkflowStatus.en_revision) {
    return 'submit_review';
  }
  if (from === WorkflowStatus.en_revision && to === WorkflowStatus.aprobado) {
    return 'approve';
  }
  if (from === WorkflowStatus.en_revision && to === WorkflowStatus.rechazado) {
    return 'reject';
  }
  if (from === WorkflowStatus.aprobado && to === WorkflowStatus.publicado) {
    return 'publish';
  }
  if (from === WorkflowStatus.publicado && to === WorkflowStatus.despublicado) {
    return 'unpublish';
  }
  if (from === WorkflowStatus.rechazado && to === WorkflowStatus.borrador_ia) {
    return 'regenerate_draft';
  }
  return null;
}

export function listWorkflowActions(
  status: WorkflowStatus,
  permissions: { canUpdate: boolean; canPublish: boolean },
): WorkflowActionDescriptor[] {
  const targets = EDITORIAL_TRANSITIONS_UI[status] ?? [];
  const actions: WorkflowActionDescriptor[] = [];

  for (const target of targets) {
    const kind = kindForTransition(status, target);
    if (!kind) continue;
    const meta = ACTION_META[kind];
    const allowed =
      meta.permission === 'content.publish'
        ? permissions.canPublish
        : permissions.canUpdate;
    if (!allowed) continue;
    actions.push({
      kind,
      targetStatus: target,
      label: meta.label,
      permission: meta.permission,
      variant: meta.variant,
    });
  }

  if (
    status === WorkflowStatus.aprobado &&
    permissions.canPublish
  ) {
    actions.push({
      kind: 'schedule',
      targetStatus: WorkflowStatus.publicado,
      label: ACTION_META.schedule.label,
      permission: 'content.publish',
      variant: 'secondary',
    });
  }

  return actions;
}

export const WORKFLOW_STEP_ORDER: WorkflowStatus[] = [
  WorkflowStatus.borrador_ia,
  WorkflowStatus.en_revision,
  WorkflowStatus.aprobado,
  WorkflowStatus.publicado,
];

export function stepIndexForStatus(status: WorkflowStatus): number {
  if (status === WorkflowStatus.rechazado) {
    return 1;
  }
  if (status === WorkflowStatus.despublicado) {
    return 3;
  }
  const idx = WORKFLOW_STEP_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}
