import 'server-only';

import {
  createMediaAssetSchema,
  updateMediaAssetSchema,
} from '@/lib/content/schemas/media';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { resolveMediaFileUrl } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

export { createMediaAssetSchema, updateMediaAssetSchema } from '@/lib/content/schemas/media';

const ENTITY_TYPE = 'media_asset';

export async function createMediaAsset(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createMediaAssetSchema.parse(raw);
  const fileUrl = resolveMediaFileUrl(input.fileUrl, env.MEDIA_STORAGE_BASE_URL);

  return db.$transaction(async (tx) => {
    return tx.mediaAsset.create({
      data: {
        fileUrl,
        assetType: input.assetType,
        mimeType: input.mimeType ?? null,
        altText: input.altText ?? null,
        title: input.title ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        fileSizeKb: input.fileSizeKb ?? null,
        includeInImageSitemap: input.includeInImageSitemap ?? true,
        createdById: user.userId,
        updatedById: user.userId,
      },
      select: { id: true },
    });
  });
}

export async function updateMediaAsset(
  user: PortalSessionPayload,
  mediaId: string,
  raw: unknown,
): Promise<void> {
  const input = updateMediaAssetSchema.parse(raw);
  const existing = await db.mediaAsset.findFirst({
    where: { id: mediaId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  const fileUrl =
    input.fileUrl !== undefined
      ? resolveMediaFileUrl(input.fileUrl, env.MEDIA_STORAGE_BASE_URL)
      : undefined;

  await db.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id: mediaId },
      data: {
        ...(fileUrl !== undefined ? { fileUrl } : {}),
        ...(input.assetType !== undefined ? { assetType: input.assetType } : {}),
        ...(input.mimeType !== undefined ? { mimeType: input.mimeType } : {}),
        ...(input.altText !== undefined ? { altText: input.altText } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.width !== undefined ? { width: input.width } : {}),
        ...(input.height !== undefined ? { height: input.height } : {}),
        ...(input.fileSizeKb !== undefined ? { fileSizeKb: input.fileSizeKb } : {}),
        ...(input.includeInImageSitemap !== undefined
          ? { includeInImageSitemap: input.includeInImageSitemap }
          : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: mediaId,
    });
  });
}

export async function softDeleteMediaAsset(
  user: PortalSessionPayload,
  mediaId: string,
): Promise<void> {
  const existing = await db.mediaAsset.findFirst({
    where: { id: mediaId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id: mediaId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: mediaId,
    });
  });
}
