import 'server-only';

import { type Prisma, type WorkflowStatus } from '@prisma/client';

import { ContentNotFoundError } from '@/lib/content/errors';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { getEditorialRegistryEntry } from '@/lib/content/workflow-registry';
import { db } from '@/lib/db';

export async function createRevision(
  tx: Prisma.TransactionClient,
  params: {
    contentType: EditorialContentType;
    contentId: string;
    editorId: string;
    workflowStatusAt: WorkflowStatus;
    aiGenerationId?: string;
    changeSummary?: string;
  },
): Promise<{ versionNumber: number }> {
  const entry = getEditorialRegistryEntry(params.contentType);
  const row = await entry.loadInTx(tx, params.contentId);
  if (!row) {
    throw new ContentNotFoundError();
  }

  const versionNumber = row.currentVersion + 1;

  await tx.contentRevision.create({
    data: {
      contentType: params.contentType,
      contentId: params.contentId,
      versionNumber,
      bodySnapshot: entry.extractBody(row) as Prisma.InputJsonValue,
      seoSnapshot: (entry.extractSeo(row) ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      workflowStatusAt: params.workflowStatusAt,
      editorId: params.editorId,
      aiGenerationId: params.aiGenerationId ?? null,
      changeSummary: params.changeSummary ?? null,
    },
  });

  await entry.setCurrentVersion(
    tx,
    params.contentId,
    versionNumber,
    params.editorId,
  );

  return { versionNumber };
}

const DEFAULT_REVISION_LIST_LIMIT = 50;

export type ContentRevisionListItem = {
  versionNumber: number;
  workflowStatusAt: WorkflowStatus;
  editorId: string;
  editorName: string;
  changeSummary: string | null;
  createdAt: Date;
};

export async function listContentRevisions(
  contentType: EditorialContentType,
  contentId: string,
  limit = DEFAULT_REVISION_LIST_LIMIT,
): Promise<ContentRevisionListItem[]> {
  const capped = Math.min(Math.max(limit, 1), 100);
  const rows = await db.contentRevision.findMany({
    where: { contentType, contentId },
    orderBy: { versionNumber: 'desc' },
    take: capped,
    select: {
      versionNumber: true,
      workflowStatusAt: true,
      editorId: true,
      changeSummary: true,
      createdAt: true,
    },
  });

  if (rows.length === 0) {
    return [];
  }

  const editorIds = [...new Set(rows.map((r) => r.editorId))];
  const editors = await db.user.findMany({
    where: { id: { in: editorIds } },
    select: { id: true, fullName: true },
  });
  const nameById = new Map(editors.map((e) => [e.id, e.fullName]));

  return rows.map((row) => ({
    versionNumber: row.versionNumber,
    workflowStatusAt: row.workflowStatusAt,
    editorId: row.editorId,
    editorName: nameById.get(row.editorId) ?? 'Usuario desconocido',
    changeSummary: row.changeSummary,
    createdAt: row.createdAt,
  }));
}
