import 'server-only';

import { AuditAction } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import {
  InvalidTransitionError,
  ProjectValidationError,
} from './errors';
import { maybeSetFirstResponseAt } from './first-response';
import { loadProjectForMutation } from './mutation-context';
import type { ChangeStateInput } from './project-mutation-schemas';

export async function changeProjectState(
  user: PortalSessionPayload,
  projectId: string,
  input: ChangeStateInput,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const project = await loadProjectForMutation(tx, projectId, user);

    const target = await tx.projectState.findFirst({
      where: { slug: input.toStateSlug, deletedAt: null },
    });
    if (!target) {
      throw new ProjectValidationError('Estado destino no válido');
    }

    const current = await tx.projectState.findUnique({
      where: { id: project.stateId },
    });

    if (!current || current.isTerminal || target.id === project.stateId) {
      throw new InvalidTransitionError();
    }

    if (target.isTerminal && current.isTerminal) {
      throw new InvalidTransitionError();
    }

    await tx.project.update({
      where: { id: projectId },
      data: { stateId: target.id },
    });

    await tx.projectStateHistory.create({
      data: {
        projectId,
        fromStateId: project.stateId,
        toStateId: target.id,
        changedById: user.userId,
        note: input.note ?? null,
      },
    });

    await maybeSetFirstResponseAt(tx, projectId);

    await recordAudit(
      {
        userId: user.userId,
        action: AuditAction.state_change,
        entityType: 'projects',
        entityId: projectId,
        metadata: {
          fromState: current.slug,
          toState: target.slug,
        },
      },
      { tx },
    );
  });
}
