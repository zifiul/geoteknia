import 'server-only';

import type { Prisma } from '@prisma/client';

import { assertOwnership } from '@/lib/auth/rbac';
import { ForbiddenError } from '@/lib/auth/rbac-errors';
import type { PortalSessionPayload } from '@/lib/auth/session';

import { ProjectNotFoundError } from './errors';

export type ProjectMutationRow = {
  id: string;
  stateId: string;
  assignedTechnicianId: string | null;
};

export async function loadProjectForMutation(
  tx: Prisma.TransactionClient,
  projectId: string,
  user: PortalSessionPayload,
): Promise<ProjectMutationRow> {
  const project = await tx.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      id: true,
      stateId: true,
      assignedTechnicianId: true,
    },
  });

  if (!project) {
    throw new ProjectNotFoundError();
  }

  try {
    assertOwnership(project, user);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw error;
    }
    throw error;
  }

  return project;
}
