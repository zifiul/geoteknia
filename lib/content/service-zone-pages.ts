import 'server-only';

import { WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import {
  assertActiveGeoZoneIds,
  assertActiveServiceIds,
} from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const bodySchema = z.object({
  serviceId: z.uuid(),
  zoneId: z.uuid(),
  targetKeyword: z.string().nullable().optional(),
  body: z.string().min(1),
});

export const createServiceZonePageSchema = bodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateServiceZonePageSchema = bodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'service_zone_page';

export async function createServiceZonePage(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createServiceZonePageSchema.parse(raw);
  await assertActiveServiceIds(db, [input.serviceId]);
  await assertActiveGeoZoneIds(db, [input.zoneId]);
  await ensureUniqueSlug(db.serviceZonePage, input.slug);

  return db.$transaction(async (tx) => {
    return tx.serviceZonePage.create({
      data: {
        serviceId: input.serviceId,
        zoneId: input.zoneId,
        targetKeyword: input.targetKeyword ?? null,
        body: input.body,
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
  });
}

export async function updateServiceZonePage(
  user: PortalSessionPayload,
  pageId: string,
  raw: unknown,
): Promise<void> {
  const input = updateServiceZonePageSchema.parse(raw);
  const existing = await db.serviceZonePage.findFirst({
    where: { id: pageId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  if (input.zoneId) {
    await assertActiveGeoZoneIds(db, [input.zoneId]);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.serviceZonePage, input.slug, { excludeId: pageId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.serviceZonePage.update({
      where: { id: pageId },
      data: {
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.zoneId !== undefined ? { zoneId: input.zoneId } : {}),
        ...(input.targetKeyword !== undefined
          ? { targetKeyword: input.targetKeyword }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
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
      entityId: pageId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteServiceZonePage(
  user: PortalSessionPayload,
  pageId: string,
): Promise<void> {
  const existing = await db.serviceZonePage.findFirst({
    where: { id: pageId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.serviceZonePage.update({
      where: { id: pageId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: pageId,
      entitySlug: existing.slug,
    });
  });
}
