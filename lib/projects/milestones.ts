import 'server-only';

import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import { ProjectNotFoundError } from './errors';
import { loadProjectForMutation } from './mutation-context';
import type { CreateMilestoneInput } from './project-mutation-schemas';

export async function createProjectMilestone(
  user: PortalSessionPayload,
  projectId: string,
  input: CreateMilestoneInput,
): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await loadProjectForMutation(tx, projectId, user);

    const milestone = await tx.projectMilestone.create({
      data: {
        projectId,
        title: input.title,
        dueDate: input.dueDate ?? null,
        status: input.status ?? null,
        createdById: user.userId,
      },
      select: { id: true },
    });

    return milestone;
  });
}

export async function completeProjectMilestone(
  user: PortalSessionPayload,
  milestoneId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const milestone = await tx.projectMilestone.findFirst({
      where: { id: milestoneId, deletedAt: null },
      select: { id: true, projectId: true, completedAt: true },
    });

    if (!milestone) {
      throw new ProjectNotFoundError();
    }

    await loadProjectForMutation(tx, milestone.projectId, user);

    if (milestone.completedAt) {
      return;
    }

    await tx.projectMilestone.update({
      where: { id: milestoneId },
      data: { completedAt: new Date(), updatedById: user.userId },
    });
  });
}
