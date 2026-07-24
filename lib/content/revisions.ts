import 'server-only';

import { type Prisma, type WorkflowStatus } from '@prisma/client';

import { ContentNotFoundError } from '@/lib/content/errors';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { getEditorialRegistryEntry } from '@/lib/content/workflow-registry';

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
