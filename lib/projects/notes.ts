import 'server-only';

import { AuditAction } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import { ProjectNotFoundError } from './errors';
import { loadProjectForMutation } from './mutation-context';
import type { CreateNoteInput } from './project-mutation-schemas';

export async function createProjectNote(
  user: PortalSessionPayload,
  projectId: string,
  input: CreateNoteInput,
): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await loadProjectForMutation(tx, projectId, user);

    const note = await tx.projectNote.create({
      data: {
        projectId,
        authorId: user.userId,
        body: input.body,
        createdById: user.userId,
      },
      select: { id: true },
    });

    return note;
  });
}

export async function deleteProjectNote(
  user: PortalSessionPayload,
  noteId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const note = await tx.projectNote.findFirst({
      where: { id: noteId, deletedAt: null },
      select: { id: true, projectId: true },
    });

    if (!note) {
      throw new ProjectNotFoundError();
    }

    await loadProjectForMutation(tx, note.projectId, user);

    await tx.projectNote.update({
      where: { id: noteId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });

    await recordAudit(
      {
        userId: user.userId,
        action: AuditAction.delete,
        entityType: 'project_note',
        entityId: noteId,
        metadata: { softDelete: true },
      },
      { tx },
    );
  });
}
