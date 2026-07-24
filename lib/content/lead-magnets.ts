import 'server-only';

import { WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveMediaAssetIds, assertActiveServiceIds } from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

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
