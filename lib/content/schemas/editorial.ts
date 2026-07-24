import { WorkflowStatus } from '@prisma/client';
import { z } from 'zod';

/** Estados permitidos en create/update vía CRUD (sin publicar ni aprobar). */
export const CRUD_WORKFLOW_STATUSES = [
  WorkflowStatus.borrador_ia,
  WorkflowStatus.en_revision,
  WorkflowStatus.rechazado,
  WorkflowStatus.despublicado,
] as const;

const crudWorkflowStatusSchema = z
  .nativeEnum(WorkflowStatus)
  .refine(
    (status) =>
      (CRUD_WORKFLOW_STATUSES as readonly WorkflowStatus[]).includes(status),
    { message: 'Estado editorial no permitido en CRUD' },
  );

export const editorialCrudBlockSchema = z.object({
  workflowStatus: crudWorkflowStatusSchema.optional(),
  isAiAssisted: z.boolean().optional(),
  authorId: z.uuid().nullable().optional(),
});

export type EditorialCrudBlockInput = z.infer<typeof editorialCrudBlockSchema>;

export const editorialCrudBlockPartialSchema = editorialCrudBlockSchema.partial();

export function assertCrudWorkflowNotPublished(
  status: WorkflowStatus | undefined,
): void {
  if (
    status === WorkflowStatus.publicado ||
    status === WorkflowStatus.aprobado
  ) {
    throw new Error('Estado editorial no permitido en CRUD');
  }
}
