import 'server-only';

import { AuditAction } from '@prisma/client';

import { recordAudit } from '@/lib/audit/log';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

import { ProjectNotFoundError } from './errors';
import { loadProjectForMutation } from './mutation-context';
import type { AttachDocumentInput } from './project-mutation-schemas';

export async function attachProjectDocument(
  user: PortalSessionPayload,
  projectId: string,
  input: AttachDocumentInput,
): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    await loadProjectForMutation(tx, projectId, user);

    const doc = await tx.projectDocument.create({
      data: {
        projectId,
        mediaAssetId: input.mediaAssetId ?? null,
        fileUrl: input.fileUrl ?? null,
        docType: input.docType,
        uploadedById: user.userId,
        createdById: user.userId,
      },
      select: { id: true },
    });

    return doc;
  });
}

export async function deleteProjectDocument(
  user: PortalSessionPayload,
  documentId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const doc = await tx.projectDocument.findFirst({
      where: { id: documentId, deletedAt: null },
      select: { id: true, projectId: true, docType: true },
    });

    if (!doc) {
      throw new ProjectNotFoundError();
    }

    await loadProjectForMutation(tx, doc.projectId, user);

    await tx.projectDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });

    await recordAudit(
      {
        userId: user.userId,
        action: AuditAction.delete,
        entityType: 'project_document',
        entityId: documentId,
        metadata: { softDelete: true, docType: doc.docType },
      },
      { tx },
    );
  });
}
