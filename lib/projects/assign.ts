import 'server-only';

import { AuditAction, RoleName } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import { ProjectValidationError } from './errors';
import { maybeSetFirstResponseAt } from './first-response';
import { loadProjectForMutation } from './mutation-context';
import type { AssignTechnicianInput } from './project-mutation-schemas';

export async function assignProjectTechnician(
  user: PortalSessionPayload,
  projectId: string,
  input: AssignTechnicianInput,
): Promise<void> {
  await db.$transaction(async (tx) => {
    await loadProjectForMutation(tx, projectId, user);

    const technician = await tx.user.findFirst({
      where: {
        id: input.technicianId,
        deletedAt: null,
        role: { name: RoleName.tecnico },
      },
      select: { id: true },
    });

    if (!technician) {
      throw new ProjectValidationError('Técnico no válido');
    }

    await tx.project.update({
      where: { id: projectId },
      data: { assignedTechnicianId: input.technicianId },
    });

    await maybeSetFirstResponseAt(tx, projectId);

    await recordAudit(
      {
        userId: user.userId,
        action: AuditAction.assign,
        entityType: 'projects',
        entityId: projectId,
        metadata: { technicianId: input.technicianId },
      },
      { tx },
    );
  });
}
