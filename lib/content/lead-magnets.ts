import 'server-only';

import { WorkflowStatus, type Prisma, type SchemaType } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveMediaAssetIds, assertActiveServiceIds } from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug, resolveMediaFileUrl } from '@/lib/content/slug';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const leadMagnetBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  fileId: z.uuid(),
  serviceId: z.uuid().nullable().optional(),
  thankYouUrl: z.url(),
  isGated: z.boolean().optional(),
});

export const createLeadMagnetSchema = leadMagnetBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateLeadMagnetSchema = leadMagnetBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'lead_magnet';

export async function createLeadMagnet(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createLeadMagnetSchema.parse(raw);
  await assertActiveMediaAssetIds(db, [input.fileId]);
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  await ensureUniqueSlug(db.leadMagnet, input.slug);

  return db.leadMagnet.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      fileId: input.fileId,
      serviceId: input.serviceId ?? null,
      thankYouUrl: input.thankYouUrl,
      isGated: input.isGated ?? true,
      slug: input.slug,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      schemaType: input.schemaType,
      noindex: input.noindex ?? false,
      ogImageId: input.ogImageId ?? null,
      h1: input.h1 ?? null,
      workflowStatus: WorkflowStatus.borrador_ia,
      isAiAssisted: input.isAiAssisted ?? false,
      authorId: input.authorId ?? user.userId,
      createdById: user.userId,
      updatedById: user.userId,
    },
    select: { id: true },
  });
}

export async function updateLeadMagnet(
  user: PortalSessionPayload,
  leadMagnetId: string,
  raw: unknown,
): Promise<void> {
  const input = updateLeadMagnetSchema.parse(raw);
  const existing = await db.leadMagnet.findFirst({
    where: { id: leadMagnetId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.fileId) {
    await assertActiveMediaAssetIds(db, [input.fileId]);
  }
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.leadMagnet, input.slug, { excludeId: leadMagnetId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.leadMagnet.update({
      where: { id: leadMagnetId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.fileId !== undefined ? { fileId: input.fileId } : {}),
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.thankYouUrl !== undefined
          ? { thankYouUrl: input.thankYouUrl }
          : {}),
        ...(input.isGated !== undefined ? { isGated: input.isGated } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
        ...(input.metaDescription !== undefined
          ? { metaDescription: input.metaDescription }
          : {}),
        ...(input.canonicalUrl !== undefined
          ? { canonicalUrl: input.canonicalUrl }
          : {}),
        ...(input.schemaType !== undefined ? { schemaType: input.schemaType } : {}),
        ...(input.noindex !== undefined ? { noindex: input.noindex } : {}),
        ...(input.ogImageId !== undefined ? { ogImageId: input.ogImageId } : {}),
        ...(input.h1 !== undefined ? { h1: input.h1 } : {}),
        ...(input.workflowStatus !== undefined
          ? { workflowStatus: input.workflowStatus }
          : {}),
        ...(input.isAiAssisted !== undefined
          ? { isAiAssisted: input.isAiAssisted }
          : {}),
        ...(input.authorId !== undefined ? { authorId: input.authorId } : {}),
        updatedById: user.userId,
      },
    });
    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: leadMagnetId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteLeadMagnet(
  user: PortalSessionPayload,
  leadMagnetId: string,
): Promise<void> {
  const existing = await db.leadMagnet.findFirst({
    where: { id: leadMagnetId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.leadMagnet.update({
      where: { id: leadMagnetId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: leadMagnetId,
      entitySlug: existing.slug,
    });
  });
}

/**
 * Consulta pública de lead magnet gated por slug para captación (GTK-30).
 * Retorna null si no existe, si no es gated (isGated=false), si fileId es null o está borrado.
 */
export async function findGatedLeadMagnetBySlug(slug: string) {
  return db.leadMagnet.findFirst({
    where: {
      slug,
      isGated: true,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thankYouUrl: true,
      fileId: true,
      serviceId: true,
    },
  });
}

export type PublishedLeadMagnetListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
};

export type PublishedLeadMagnetDetail = PublishedLeadMagnetListItem & {
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaType: SchemaType;
  noindex: boolean;
  ogImageId: string | null;
  service: { slug: string; name: string } | null;
};

const publishedGatedWhere = {
  ...PUBLISHED_EDITORIAL_WHERE,
  isGated: true,
} as const;

export async function listPublishedLeadMagnets(): Promise<PublishedLeadMagnetListItem[]> {
  const rows = await db.leadMagnet.findMany({
    where: publishedGatedWhere,
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      ogImageId: true,
    },
  });

  const imageIds = [
    ...new Set(rows.map((row) => row.ogImageId).filter((id): id is string => Boolean(id))),
  ];
  const assets =
    imageIds.length > 0
      ? await db.mediaAsset.findMany({
          where: { id: { in: imageIds }, deletedAt: null },
          select: { id: true, fileUrl: true, altText: true },
        })
      : [];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const mediaBase = env.MEDIA_STORAGE_BASE_URL;

  return rows.map((row) => {
    const asset = row.ogImageId ? assetById.get(row.ogImageId) : undefined;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      coverImageUrl: asset
        ? resolveMediaFileUrl(asset.fileUrl, mediaBase)
        : null,
      coverImageAlt: asset?.altText ?? null,
    };
  });
}

export async function getPublishedLeadMagnetBySlug(
  slug: string,
): Promise<PublishedLeadMagnetDetail | null> {
  const row = await db.leadMagnet.findFirst({
    where: { slug, ...publishedGatedWhere },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      h1: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      schemaType: true,
      noindex: true,
      ogImageId: true,
      service: {
        select: {
          slug: true,
          name: true,
          workflowStatus: true,
          deletedAt: true,
        },
      },
    },
  });
  if (!row) {
    return null;
  }

  const service =
    row.service &&
    row.service.deletedAt === null &&
    row.service.workflowStatus === WorkflowStatus.publicado
      ? { slug: row.service.slug, name: row.service.name }
      : null;

  let coverImageUrl: string | null = null;
  let coverImageAlt: string | null = null;
  if (row.ogImageId) {
    const asset = await db.mediaAsset.findFirst({
      where: { id: row.ogImageId, deletedAt: null },
      select: { fileUrl: true, altText: true },
    });
    if (asset) {
      coverImageUrl = resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL);
      coverImageAlt = asset.altText;
    }
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverImageUrl,
    coverImageAlt,
    h1: row.h1,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    schemaType: row.schemaType,
    noindex: row.noindex,
    ogImageId: row.ogImageId,
    service,
  };
}

export async function listPublishedLeadMagnetSlugs(): Promise<{ slug: string }[]> {
  const rows = await db.leadMagnet.findMany({
    where: publishedGatedWhere,
    select: { slug: true },
  });
  return rows.map((row) => ({ slug: row.slug }));
}

