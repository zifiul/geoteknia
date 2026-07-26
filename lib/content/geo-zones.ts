import 'server-only';

import { WorkflowStatus, type Prisma, type SchemaType } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import { assertActiveProvinceId } from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug, resolveMediaFileUrl } from '@/lib/content/slug';
import {
  countWordsFromBody,
  geoZoneWordCountWarning,
} from '@/lib/content/word-count';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import { buildSiloPath } from '@/lib/seo/silo-urls';

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

export type PublishedGeoZoneListItem = {
  id: string;
  name: string;
  slug: string;
};

export async function listPublishedGeoZones(
  params?: { take?: number },
): Promise<PublishedGeoZoneListItem[]> {
  const take = params?.take ?? 50;
  return db.geoZone.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    orderBy: { name: 'asc' },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export type PublishedGeoZoneProvince = {
  name: string;
  slug: string;
  ccaa: string;
};

export type PublishedGeoZoneDetail = {
  id: string;
  name: string;
  slug: string;
  localGeology: string;
  operationalBase: string | null;
  body: string;
  h1: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaType: SchemaType;
  noindex: boolean;
  province: PublishedGeoZoneProvince;
};

export async function getPublishedGeoZoneBySlug(
  slug: string,
): Promise<PublishedGeoZoneDetail | null> {
  const row = await db.geoZone.findFirst({
    where: { slug, ...PUBLISHED_EDITORIAL_WHERE },
    select: {
      id: true,
      name: true,
      slug: true,
      localGeology: true,
      operationalBase: true,
      body: true,
      h1: true,
      heroImageId: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      schemaType: true,
      noindex: true,
      province: {
        select: { name: true, slug: true, ccaa: true },
      },
    },
  });
  if (!row) {
    return null;
  }
  let heroImageUrl: string | null = null;
  let heroImageAlt: string | null = null;
  if (row.heroImageId) {
    const asset = await db.mediaAsset.findFirst({
      where: { id: row.heroImageId, deletedAt: null },
      select: { fileUrl: true, altText: true },
    });
    if (asset) {
      heroImageUrl = resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL);
      heroImageAlt = asset.altText;
    }
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    localGeology: row.localGeology,
    operationalBase: row.operationalBase,
    body: row.body,
    h1: row.h1,
    heroImageUrl,
    heroImageAlt,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    schemaType: row.schemaType,
    noindex: row.noindex,
    province: row.province,
  };
}

export type ZoneServiceCoverageLink = {
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  href: string;
  label: string;
  isIntersectionPage: boolean;
};

export async function listServiceCoverageByZone(
  zoneId: string,
  zoneSlug: string,
): Promise<ZoneServiceCoverageLink[]> {
  const coverage = await db.serviceZoneCoverage.findMany({
    where: {
      zoneId,
      service: PUBLISHED_EDITORIAL_WHERE,
    },
    orderBy: { service: { name: 'asc' } },
    select: {
      service: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const intersectionPages = await db.serviceZonePage.findMany({
    where: { zoneId, ...PUBLISHED_EDITORIAL_WHERE },
    select: {
      serviceId: true,
      slug: true,
      h1: true,
      service: { select: { slug: true } },
    },
  });
  const pageByServiceId = new Map(
    intersectionPages.map((page) => [page.serviceId, page]),
  );

  return coverage.map(({ service }) => {
    const page = pageByServiceId.get(service.id);
    if (page) {
      return {
        serviceId: service.id,
        serviceName: service.name,
        serviceSlug: service.slug,
        href: buildSiloPath('service_zone_page', {
          slug: page.slug,
          serviceSlug: service.slug,
          zoneSlug,
        }),
        label: page.h1?.trim() || `${service.name} en ${zoneSlug}`,
        isIntersectionPage: true,
      };
    }
    return {
      serviceId: service.id,
      serviceName: service.name,
      serviceSlug: service.slug,
      href: buildSiloPath('service', { slug: service.slug }),
      label: service.name,
      isIntersectionPage: false,
    };
  });
}
