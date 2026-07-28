import { WorkflowStatus } from '@prisma/client';

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  [WorkflowStatus.borrador_ia]: 'Borrador IA',
  [WorkflowStatus.en_revision]: 'En revisión',
  [WorkflowStatus.aprobado]: 'Aprobado',
  [WorkflowStatus.publicado]: 'Publicado',
  [WorkflowStatus.rechazado]: 'Rechazado',
  [WorkflowStatus.despublicado]: 'Despublicado',
};

export const WORKFLOW_STATUS_OPTIONS = (
  Object.keys(WorkflowStatus) as WorkflowStatus[]
).map((value) => ({
  value,
  label: WORKFLOW_STATUS_LABELS[value],
}));
