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
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import { resolveMediaFileUrl } from '@/lib/content/slug';
import { env } from '@/lib/env';
import type { SchemaType } from '@prisma/client';

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

export type PublishedServiceZonePageLink = {
  id: string;
  slug: string;
  title: string;
  zoneName: string;
  zoneSlug: string;
};

export async function listPublishedServiceZonePagesByService(
  serviceId: string,
): Promise<PublishedServiceZonePageLink[]> {
  const rows = await db.serviceZonePage.findMany({
    where: { serviceId, ...PUBLISHED_EDITORIAL_WHERE },
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      h1: true,
      zone: {
        select: { name: true, slug: true },
      },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.h1?.trim() || row.zone.name,
    zoneName: row.zone.name,
    zoneSlug: row.zone.slug,
  }));
}

export type PublishedServiceZonePageDetail = {
  id: string;
  slug: string;
  body: string;
  targetKeyword: string | null;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaType: SchemaType;
  noindex: boolean;
  service: {
    id: string;
    name: string;
    slug: string;
    summary: string | null;
    heroImageUrl: string | null;
    heroImageAlt: string | null;
  };
  zone: {
    id: string;
    name: string;
    slug: string;
    province: { name: string; slug: string };
  };
};

export async function getPublishedServiceZonePageBySlugs(
  serviceSlug: string,
  zoneSlug: string,
): Promise<PublishedServiceZonePageDetail | null> {
  const service = await db.service.findFirst({
    where: { slug: serviceSlug, ...PUBLISHED_EDITORIAL_WHERE },
    select: {
      id: true,
      name: true,
      slug: true,
      summary: true,
      heroImageId: true,
    },
  });
  if (!service) {
    return null;
  }

  const zone = await db.geoZone.findFirst({
    where: { slug: zoneSlug, ...PUBLISHED_EDITORIAL_WHERE },
    select: {
      id: true,
      name: true,
      slug: true,
      province: { select: { name: true, slug: true } },
    },
  });
  if (!zone) {
    return null;
  }

  const page = await db.serviceZonePage.findFirst({
    where: {
      serviceId: service.id,
      zoneId: zone.id,
      ...PUBLISHED_EDITORIAL_WHERE,
    },
    select: {
      id: true,
      slug: true,
      body: true,
      targetKeyword: true,
      h1: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      schemaType: true,
      noindex: true,
    },
  });
  if (!page) {
    return null;
  }

  let heroImageUrl: string | null = null;
  let heroImageAlt: string | null = null;
  if (service.heroImageId) {
    const asset = await db.mediaAsset.findFirst({
      where: { id: service.heroImageId, deletedAt: null },
      select: { fileUrl: true, altText: true },
    });
    if (asset) {
      heroImageUrl = resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL);
      heroImageAlt = asset.altText;
    }
  }

  return {
    id: page.id,
    slug: page.slug,
    body: page.body,
    targetKeyword: page.targetKeyword,
    h1: page.h1,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    canonicalUrl: page.canonicalUrl,
    schemaType: page.schemaType,
    noindex: page.noindex,
    service: {
      id: service.id,
      name: service.name,
      slug: service.slug,
      summary: service.summary,
      heroImageUrl,
      heroImageAlt,
    },
    zone: {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      province: zone.province,
    },
  };
}

export async function listPublishedServiceZonePageStaticParams(): Promise<
  { slug: string; zona: string }[]
> {
  const rows = await db.serviceZonePage.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    select: {
      service: { select: { slug: true } },
      zone: { select: { slug: true } },
    },
  });
  return rows.map((row) => ({
    slug: row.service.slug,
    zona: row.zone.slug,
  }));
}
