import 'server-only';

import { WorkflowStatus, type Prisma, SchemaType } from '@prisma/client';
import { z } from 'zod';

import {
  recordContentDeleteAudit,
  recordContentUpdateAudit,
} from '@/lib/content/content-audit';
import { ContentNotFoundError } from '@/lib/content/errors';
import {
  assertActiveProvinceId,
  assertActiveServiceIds,
  assertActiveTeamMemberIds,
  assertActiveWorkTypologyId,
} from '@/lib/content/references';
import { editorialCrudBlockSchema } from '@/lib/content/schemas/editorial';
import { seoBlockSchema } from '@/lib/content/schemas/seo';
import { ensureUniqueSlug } from '@/lib/content/slug';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { parseCatalogYearRaw } from '@/lib/cases/catalog-search-params';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { PUBLISHED_EDITORIAL_WHERE } from '@/lib/content/published-filter';
import { resolveMediaFileUrl } from '@/lib/content/slug';

const caseStudyBodySchema = z.object({
  title: z.string().min(1),
  serviceId: z.uuid(),
  provinceId: z.uuid(),
  workTypologyId: z.uuid(),
  clientName: z.string().nullable().optional(),
  clientIsPublic: z.boolean().optional(),
  problem: z.string().min(1),
  solution: z.string().min(1),
  boreholesCount: z.number().int().nullable().optional(),
  metersDrilled: z.coerce.number().nullable().optional(),
  testsSummary: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  projectYear: z.number().int().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  sourceProjectId: z.uuid().nullable().optional(),
  teamMemberIds: z.array(z.uuid()).optional(),
});

export const createCaseStudySchema = caseStudyBodySchema
  .merge(seoBlockSchema)
  .merge(editorialCrudBlockSchema);

export const updateCaseStudySchema = caseStudyBodySchema
  .partial()
  .merge(seoBlockSchema.partial())
  .merge(editorialCrudBlockSchema.partial());

const ENTITY_TYPE = 'case_study';

async function syncCaseStudyTeam(
  tx: Prisma.TransactionClient,
  caseStudyId: string,
  teamMemberIds: string[],
): Promise<void> {
  await assertActiveTeamMemberIds(tx, teamMemberIds);
  await tx.caseStudyTeamMember.deleteMany({ where: { caseStudyId } });
  if (teamMemberIds.length > 0) {
    await tx.caseStudyTeamMember.createMany({
      data: teamMemberIds.map((teamMemberId) => ({
        caseStudyId,
        teamMemberId,
      })),
    });
  }
}

export async function createCaseStudy(
  user: PortalSessionPayload,
  raw: unknown,
): Promise<{ id: string }> {
  const input = createCaseStudySchema.parse(raw);
  await assertActiveServiceIds(db, [input.serviceId]);
  await assertActiveProvinceId(db, input.provinceId);
  await assertActiveWorkTypologyId(db, input.workTypologyId);
  await ensureUniqueSlug(db.caseStudy, input.slug);

  return db.$transaction(async (tx) => {
    const row = await tx.caseStudy.create({
      data: {
        title: input.title,
        serviceId: input.serviceId,
        provinceId: input.provinceId,
        workTypologyId: input.workTypologyId,
        clientName: input.clientName ?? null,
        clientIsPublic: input.clientIsPublic ?? false,
        problem: input.problem,
        solution: input.solution,
        boreholesCount: input.boreholesCount ?? null,
        metersDrilled: input.metersDrilled ?? null,
        testsSummary: input.testsSummary ?? null,
        result: input.result ?? null,
        projectYear: input.projectYear ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        sourceProjectId: input.sourceProjectId ?? null,
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
    if (input.teamMemberIds) {
      await syncCaseStudyTeam(tx, row.id, input.teamMemberIds);
    }
    return row;
  });
}

export async function updateCaseStudy(
  user: PortalSessionPayload,
  caseStudyId: string,
  raw: unknown,
): Promise<void> {
  const input = updateCaseStudySchema.parse(raw);
  const existing = await db.caseStudy.findFirst({
    where: { id: caseStudyId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  if (input.serviceId) {
    await assertActiveServiceIds(db, [input.serviceId]);
  }
  if (input.provinceId) {
    await assertActiveProvinceId(db, input.provinceId);
  }
  if (input.workTypologyId) {
    await assertActiveWorkTypologyId(db, input.workTypologyId);
  }
  if (input.slug) {
    await ensureUniqueSlug(db.caseStudy, input.slug, { excludeId: caseStudyId });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.caseStudy.update({
      where: { id: caseStudyId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
        ...(input.provinceId !== undefined ? { provinceId: input.provinceId } : {}),
        ...(input.workTypologyId !== undefined
          ? { workTypologyId: input.workTypologyId }
          : {}),
        ...(input.clientName !== undefined ? { clientName: input.clientName } : {}),
        ...(input.clientIsPublic !== undefined
          ? { clientIsPublic: input.clientIsPublic }
          : {}),
        ...(input.problem !== undefined ? { problem: input.problem } : {}),
        ...(input.solution !== undefined ? { solution: input.solution } : {}),
        ...(input.boreholesCount !== undefined
          ? { boreholesCount: input.boreholesCount }
          : {}),
        ...(input.metersDrilled !== undefined
          ? { metersDrilled: input.metersDrilled }
          : {}),
        ...(input.testsSummary !== undefined
          ? { testsSummary: input.testsSummary }
          : {}),
        ...(input.result !== undefined ? { result: input.result } : {}),
        ...(input.projectYear !== undefined ? { projectYear: input.projectYear } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.sourceProjectId !== undefined
          ? { sourceProjectId: input.sourceProjectId }
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
    if (input.teamMemberIds) {
      await syncCaseStudyTeam(tx, caseStudyId, input.teamMemberIds);
    }
    await recordContentUpdateAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: caseStudyId,
      entitySlug: input.slug ?? existing.slug,
    });
  });
}

export async function softDeleteCaseStudy(
  user: PortalSessionPayload,
  caseStudyId: string,
): Promise<void> {
  const existing = await db.caseStudy.findFirst({
    where: { id: caseStudyId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!existing) {
    throw new ContentNotFoundError();
  }
  await db.$transaction(async (tx) => {
    await tx.caseStudy.update({
      where: { id: caseStudyId },
      data: { deletedAt: new Date(), updatedById: user.userId },
    });
    await recordContentDeleteAudit(tx, user, {
      entityType: ENTITY_TYPE,
      entityId: caseStudyId,
      entitySlug: existing.slug,
    });
  });
}

export type PublishedCaseStudyListItem = {
  id: string;
  title: string;
  slug: string;
  projectYear: number | null;
};

export async function listRecentPublishedCaseStudies(
  take = 3,
): Promise<PublishedCaseStudyListItem[]> {
  return db.caseStudy.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    orderBy: [{ projectYear: 'desc' }, { updatedAt: 'desc' }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      projectYear: true,
    },
  });
}

export async function listPublishedCaseStudiesByService(
  serviceId: string,
  take = 6,
): Promise<PublishedCaseStudyListItem[]> {
  return db.caseStudy.findMany({
    where: { serviceId, ...PUBLISHED_EDITORIAL_WHERE },
    orderBy: [{ projectYear: 'desc' }, { updatedAt: 'desc' }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      projectYear: true,
    },
  });
}

export async function listPublishedCaseStudiesByTeamMember(
  teamMemberId: string,
  take = 12,
): Promise<PublishedCaseStudyListItem[]> {
  return db.caseStudy.findMany({
    where: {
      ...PUBLISHED_EDITORIAL_WHERE,
      teamMembers: { some: { teamMemberId } },
    },
    orderBy: [{ projectYear: 'desc' }, { updatedAt: 'desc' }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      projectYear: true,
    },
  });
}

export type CaseCatalogFilterInput = {
  serviceSlug?: string | null;
  workTypologySlug?: string | null;
  provinceSlug?: string | null;
  yearRaw?: string | null;
};

export type PublishedCaseStudyCatalogItem = {
  id: string;
  title: string;
  slug: string;
  projectYear: number | null;
  boreholesCount: number | null;
  metersDrilled: number | null;
  service: { id: string; name: string; slug: string };
  workTypology: { name: string; slug: string };
  province: { name: string; slug: string; ccaa: string };
  imageUrl: string | null;
  imageAlt: string | null;
};

export type CaseCatalogPageResult = {
  items: PublishedCaseStudyCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const catalogItemSelect = {
  id: true,
  title: true,
  slug: true,
  projectYear: true,
  boreholesCount: true,
  metersDrilled: true,
  ogImageId: true,
  service: { select: { id: true, name: true, slug: true } },
  workTypology: { select: { name: true, slug: true } },
  province: { select: { name: true, slug: true, ccaa: true } },
} as const;

export async function buildCaseCatalogWhere(
  filters: CaseCatalogFilterInput,
): Promise<Prisma.CaseStudyWhereInput> {
  const clauses: Prisma.CaseStudyWhereInput[] = [PUBLISHED_EDITORIAL_WHERE];

  const serviceSlug = filters.serviceSlug?.trim();
  if (serviceSlug) {
    const service = await db.service.findFirst({
      where: { slug: serviceSlug, ...PUBLISHED_EDITORIAL_WHERE },
      select: { id: true },
    });
    if (service) {
      clauses.push({ serviceId: service.id });
    }
  }

  const typologySlug = filters.workTypologySlug?.trim();
  if (typologySlug) {
    const typology = await db.workTypology.findFirst({
      where: { slug: typologySlug, deletedAt: null },
      select: { id: true },
    });
    if (typology) {
      clauses.push({ workTypologyId: typology.id });
    }
  }

  const provinceSlug = filters.provinceSlug?.trim();
  if (provinceSlug) {
    const province = await db.province.findFirst({
      where: { slug: provinceSlug, isOperational: true, deletedAt: null },
      select: { id: true },
    });
    if (province) {
      clauses.push({ provinceId: province.id });
    }
  }

  const year = parseCatalogYearRaw(filters.yearRaw);
  if (year !== undefined) {
    clauses.push({ projectYear: year });
  }

  return clauses.length === 1 ? clauses[0]! : { AND: clauses };
}

export async function countPublishedCaseStudiesForProvince(
  provinceSlug: string,
): Promise<number> {
  const where = await buildCaseCatalogWhere({ provinceSlug });
  return db.caseStudy.count({ where });
}

async function attachCatalogImages(
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    projectYear: number | null;
    boreholesCount: number | null;
    metersDrilled: Prisma.Decimal | null;
    ogImageId: string | null;
    service: { id: string; name: string; slug: string };
    workTypology: { name: string; slug: string };
    province: { name: string; slug: string; ccaa: string };
  }>,
): Promise<PublishedCaseStudyCatalogItem[]> {
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
    const meters =
      row.metersDrilled === null ? null : Number(row.metersDrilled.toString());
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      projectYear: row.projectYear,
      boreholesCount: row.boreholesCount,
      metersDrilled: Number.isFinite(meters) ? meters : null,
      service: row.service,
      workTypology: row.workTypology,
      province: row.province,
      imageUrl: asset ? resolveMediaFileUrl(asset.fileUrl, mediaBase) : null,
      imageAlt: asset?.altText ?? row.title,
    };
  });
}

export async function listPublishedCaseStudyProjectYears(): Promise<number[]> {
  const rows = await db.caseStudy.findMany({
    where: {
      ...PUBLISHED_EDITORIAL_WHERE,
      projectYear: { not: null },
    },
    distinct: ['projectYear'],
    select: { projectYear: true },
    orderBy: { projectYear: 'desc' },
  });
  return rows
    .map((row) => row.projectYear)
    .filter((year): year is number => year != null);
}

export async function listPublishedCaseStudiesCatalog(
  filters: CaseCatalogFilterInput,
  pagination: { page: number; pageSize: number },
): Promise<CaseCatalogPageResult> {
  const page = pagination.page < 1 ? 1 : pagination.page;
  const pageSize = pagination.pageSize < 1 ? 1 : pagination.pageSize;
  const where = await buildCaseCatalogWhere(filters);
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    db.caseStudy.count({ where }),
    db.caseStudy.findMany({
      where,
      orderBy: [{ projectYear: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: pageSize,
      select: catalogItemSelect,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages > 0 && page > totalPages ? totalPages : page;

  if (safePage !== page && total > 0) {
    return listPublishedCaseStudiesCatalog(filters, { page: safePage, pageSize });
  }

  const items = await attachCatalogImages(rows);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export type PublishedCaseStudyTeamMember = {
  fullName: string;
  slug: string;
  jobTitle: string;
  role: string | null;
};

export type PublishedCaseStudyDetail = {
  id: string;
  title: string;
  slug: string;
  h1: string | null;
  problem: string;
  solution: string;
  result: string | null;
  testsSummary: string | null;
  boreholesCount: number | null;
  metersDrilled: number | null;
  projectYear: number | null;
  latitude: number | null;
  longitude: number | null;
  clientName: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  schemaType: SchemaType;
  noindex: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  ogImageId: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  service: { id: string; name: string; slug: string };
  province: { name: string; slug: string; ccaa: string };
  workTypology: { name: string; slug: string };
  teamMembers: PublishedCaseStudyTeamMember[];
};

const caseStudyDetailSelect = {
  id: true,
  title: true,
  slug: true,
  h1: true,
  problem: true,
  solution: true,
  result: true,
  testsSummary: true,
  boreholesCount: true,
  metersDrilled: true,
  projectYear: true,
  latitude: true,
  longitude: true,
  clientName: true,
  clientIsPublic: true,
  metaTitle: true,
  metaDescription: true,
  canonicalUrl: true,
  schemaType: true,
  noindex: true,
  publishedAt: true,
  updatedAt: true,
  ogImageId: true,
  service: { select: { id: true, name: true, slug: true } },
  province: { select: { name: true, slug: true, ccaa: true } },
  workTypology: { select: { name: true, slug: true } },
  teamMembers: {
    where: { teamMember: PUBLISHED_EDITORIAL_WHERE },
    select: {
      role: true,
      teamMember: {
        select: { fullName: true, slug: true, jobTitle: true },
      },
    },
  },
} as const;

async function resolveCaseHeroImage(heroImageId: string | null): Promise<{
  heroImageUrl: string | null;
  heroImageAlt: string | null;
}> {
  if (!heroImageId) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  const asset = await db.mediaAsset.findFirst({
    where: { id: heroImageId, deletedAt: null },
    select: { fileUrl: true, altText: true },
  });
  if (!asset) {
    return { heroImageUrl: null, heroImageAlt: null };
  }
  return {
    heroImageUrl: resolveMediaFileUrl(asset.fileUrl, env.MEDIA_STORAGE_BASE_URL),
    heroImageAlt: asset.altText,
  };
}

export async function listPublishedCaseStudySlugs(): Promise<{ slug: string }[]> {
  return db.caseStudy.findMany({
    where: PUBLISHED_EDITORIAL_WHERE,
    select: { slug: true },
  });
}

export async function getPublishedCaseStudyBySlug(
  slug: string,
): Promise<PublishedCaseStudyDetail | null> {
  const row = await db.caseStudy.findFirst({
    where: { ...PUBLISHED_EDITORIAL_WHERE, slug },
    select: caseStudyDetailSelect,
  });
  if (!row) {
    return null;
  }

  const { heroImageUrl, heroImageAlt } = await resolveCaseHeroImage(row.ogImageId);
  const meters =
    row.metersDrilled === null ? null : Number(row.metersDrilled.toString());
  const lat =
    row.latitude === null ? null : Number(row.latitude.toString());
  const lon =
    row.longitude === null ? null : Number(row.longitude.toString());

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    h1: row.h1,
    problem: row.problem,
    solution: row.solution,
    result: row.result,
    testsSummary: row.testsSummary,
    boreholesCount: row.boreholesCount,
    metersDrilled: Number.isFinite(meters) ? meters : null,
    projectYear: row.projectYear,
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lon) ? lon : null,
    clientName: row.clientIsPublic ? row.clientName : null,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    schemaType: row.schemaType,
    noindex: row.noindex,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    ogImageId: row.ogImageId,
    heroImageUrl,
    heroImageAlt,
    service: row.service,
    province: row.province,
    workTypology: row.workTypology,
    teamMembers: row.teamMembers.map((link) => ({
      fullName: link.teamMember.fullName,
      slug: link.teamMember.slug,
      jobTitle: link.teamMember.jobTitle,
      role: link.role,
    })),
  };
}
