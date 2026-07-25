import 'server-only';

import { AuditAction, WorkflowStatus } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { ContentConflictError } from '@/lib/content/errors';
import { createRevision } from '@/lib/content/revisions';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { EDITORIAL_CONTENT_TYPES } from '@/lib/content/schemas/workflow';
import { loadEditorialEntity } from '@/lib/content/workflow-registry';
import { db } from '@/lib/db';

/** Grafo único de transiciones (GTK-39 / GTK-40). */
export const EDITORIAL_TRANSITIONS: Record<
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

export function assertTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
): void {
  const allowed = EDITORIAL_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ContentConflictError('Transición editorial no permitida');
  }
}

export type EditorialTransitionResult = {
  workflowStatus: WorkflowStatus;
  requiresTechnicalVerification?: boolean;
};

type TransitionAudit =
  | { kind: 'must'; action: AuditAction.approve | AuditAction.reject | AuditAction.publish }
  | { kind: 'content_update' };

function auditForTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
): TransitionAudit {
  if (to === WorkflowStatus.aprobado) {
    return { kind: 'must', action: AuditAction.approve };
  }
  if (to === WorkflowStatus.rechazado) {
    return { kind: 'must', action: AuditAction.reject };
  }
  if (to === WorkflowStatus.publicado) {
    return { kind: 'must', action: AuditAction.publish };
  }
  return { kind: 'content_update' };
}

export function permissionForTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
): 'content.update' | 'content.publish' {
  if (
    to === WorkflowStatus.publicado ||
    to === WorkflowStatus.despublicado
  ) {
    return 'content.publish';
  }
  void from;
  return 'content.update';
}

export type ApplyEditorialTransitionParams = {
  contentType: EditorialContentType;
  contentId: string;
  targetStatus: WorkflowStatus;
  note?: string;
  bodyChanged?: boolean;
  body?: string;
  answer?: string;
  aiGenerationId?: string;
  changeSummary?: string;
  /** GTK-40: snapshot en publish/unpublish aunque el cuerpo no cambie. */
  forceRevision?: boolean;
  /** GTK-40: metadata event=unpublish en content_update. */
  unpublishEvent?: boolean;
};

export async function applyEditorialTransition(
  user: PortalSessionPayload,
  params: ApplyEditorialTransitionParams,
): Promise<EditorialTransitionResult> {
  const { entry, row } = await loadEditorialEntity(
    params.contentType,
    params.contentId,
  );
  const from = row.workflowStatus;
  const to = params.targetStatus;

  assertTransition(from, to);

  const bodyChanged = Boolean(
    params.forceRevision ||
      params.bodyChanged ||
      params.body ||
      params.answer,
  );

  await db.$transaction(async (tx) => {
    await entry.applyWorkflowFields(tx, params.contentId, user.userId, to, {
      body: params.body,
      answer: params.answer,
    });

    if (bodyChanged) {
      await createRevision(tx, {
        contentType: params.contentType,
        contentId: params.contentId,
        editorId: user.userId,
        workflowStatusAt: to,
        aiGenerationId: params.aiGenerationId,
        changeSummary: params.changeSummary,
      });
    }

    const audit = auditForTransition(from, to);
    const metadata = {
      contentType: params.contentType,
      entitySlug: row.slug,
      previousStatus: from,
      workflowStatus: to,
      ...(params.unpublishEvent ? { event: 'unpublish' } : {}),
      ...(params.note ? { note: params.note } : {}),
    };

    if (audit.kind === 'must') {
      await recordAudit(
        {
          userId: user.userId,
          action: audit.action,
          entityType: entry.entityType,
          entityId: params.contentId,
          metadata,
        },
        { tx },
      );
    } else {
      await recordAudit(
        {
          userId: user.userId,
          action: AuditAction.content_update,
          entityType: entry.entityType,
          entityId: params.contentId,
          metadata,
        },
        { tx },
      );
    }
  });

  const requiresTechnicalVerification =
    to === WorkflowStatus.en_revision || to === WorkflowStatus.aprobado;

  return {
    workflowStatus: to,
    ...(requiresTechnicalVerification
      ? { requiresTechnicalVerification: true }
      : {}),
  };
}

export function isEditorialContentType(
  value: string,
): value is EditorialContentType {
  return (EDITORIAL_CONTENT_TYPES as readonly string[]).includes(value);
}
