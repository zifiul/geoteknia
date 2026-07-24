import 'server-only';

import { WorkflowStatus, type Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveProvinceId } from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import {
  countWordsFromBody,
  geoZoneWordCountWarning,
} from '@/lib/content/word-count';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { db } from '@/lib/db';

const geoZoneBodySchema = z.object({
  provinceId: z.uuid(),
  name: z.string().min(1),
  localGeology: z.string().min(1),
  operationalBase: z.string().nullable().optional(),
  body: z.string().min(1),
  heroImageId: z.uuid().nullable().optional(),
});

export const createGeoZoneSchema = geoZoneBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateGeoZoneSchema = geoZoneBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'geo_zone';

export async function createGeoZone(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string; warning?: string }> {
  const input = createGeoZoneSchema.parse(raw);
  await assertActiveProvinceId(db, input.provinceId);
  await ensureUniqueSlug(db.geoZone, input.slug);

  const wordCount = countWordsFromBody(input.body);
  const warning = geoZoneWordCountWarning(wordCount);

  const created = await db.$transaction(async (tx) => {
    return tx.geoZone.create({
      data: {
        provinceId: input.provinceId,
        name: input.name,
        localGeology: input.localGeology,
        operationalBase: input.operationalBase ?? null,
        body: input.body,
        wordCount,
        heroImageId: input.heroImageId ?? null,
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

  return { ...created, warning };
}

export async function updateGeoZone(
  user: PortalSessionPayload,
  geoZoneId: string,
  raw: unknown,
): Promise<{ warning?: string }> {
  const input = updateGeoZoneSchema.parse(raw);
  const existing = await db.geoZone.findFirst({
    where: { id: geoZoneId, deletedAt: null },
    select: { id: true, slug: true, body: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  if (input.provinceId) {
    await assertActiveProvinceId(db, input.provinceId);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.geoZone, input.slug, { excludeId: geoZoneId });
  }

  const body = input.body ?? existing.body;
  const wordCount = countWordsFromBody(body);
  const warning = geoZoneWordCountWarning(wordCount);

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.geoZone.update({
      where: { id: geoZoneId },
      data: {
        ...(input.provinceId !== undefined ? { provinceId: input.provinceId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.localGeology !== undefined
          ? { localGeology: input.localGeology }
          : {}),
        ...(input.operationalBase !== undefined
          ? { operationalBase: input.operationalBase }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        wordCount,
        ...(input.heroImageId !== undefined
          ? { heroImageId: input.heroImageId }
          : {}),
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
      entityId: geoZoneId,
      entitySlug: input.slug ?? existing.slug,
    });
  });

  return { warning };
}

export async function softDeleteGeoZone(
  user: PortalSessionPayload,
  geoZoneId: string,
): Promise<void> {
  const existing = await db.geoZone.findFirst({
    where: { id: geoZoneId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }

  await db.$transaction(async (tx) => {
    await tx.geoZone.update({
      where: { id: geoZoneId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: geoZoneId,
      entitySlug: existing.slug,
    });
  });
}
