import 'server-only';

import type { Prisma, WorkflowStatus } from '@prisma/client';

import type { CmsFilters } from '@/lib/admin/cms-filters-schema';
import {
  CMS_CONTENT_TYPE_CATALOG,
  CMS_SILO_LABELS,
  contentTypesForSilo,
  getCmsContentTypeMeta,
  type CmsSilo,
} from '@/lib/admin/cms-content-types';
import { requirePermission } from '@/lib/auth/rbac';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { db } from '@/lib/db';

const notDeleted = { deletedAt: null };

export type CmsContentListItem = {
  id: string;
  contentType: EditorialContentType;
  typeLabel: string;
  title: string;
  silo: CmsSilo;
  siloLabel: string;
  workflowStatus: WorkflowStatus;
  authorName: string | null;
  updatedAt: Date;
  editHref: string;
};

type RawRow = {
  id: string;
  title: string;
  workflowStatus: WorkflowStatus;
  authorId: string | null;
  updatedAt: Date;
};

function buildStatusWhere(
  filters: CmsFilters,
): { workflowStatus?: WorkflowStatus } {
  if (!filters.status) {
    return {};
  }
  return { workflowStatus: filters.status };
}

function typesToQuery(filters: CmsFilters): EditorialContentType[] {
  if (filters.type) {
    if (filters.silo) {
      const siloTypes = contentTypesForSilo(filters.silo);
      if (!siloTypes.includes(filters.type)) {
        return [];
      }
    }
    return [filters.type];
  }
  if (filters.silo) {
    return contentTypesForSilo(filters.silo);
  }
  return CMS_CONTENT_TYPE_CATALOG.map((row) => row.type);
}

async function fetchServiceRows(
  where: Prisma.ServiceWhereInput,
): Promise<RawRow[]> {
  const rows = await db.service.findMany({
    where,
    select: {
      id: true,
      name: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchGeoZoneRows(
  where: Prisma.GeoZoneWhereInput,
): Promise<RawRow[]> {
  const rows = await db.geoZone.findMany({
    where,
    select: {
      id: true,
      name: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchServiceZonePageRows(
  where: Prisma.ServiceZonePageWhereInput,
): Promise<RawRow[]> {
  const rows = await db.serviceZonePage.findMany({
    where,
    select: {
      id: true,
      slug: true,
      metaTitle: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.metaTitle?.trim() || row.slug,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchCaseStudyRows(
  where: Prisma.CaseStudyWhereInput,
): Promise<RawRow[]> {
  const rows = await db.caseStudy.findMany({
    where,
    select: {
      id: true,
      title: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchBlogPostRows(
  where: Prisma.BlogPostWhereInput,
): Promise<RawRow[]> {
  const rows = await db.blogPost.findMany({
    where,
    select: {
      id: true,
      title: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchFaqRows(where: Prisma.FaqWhereInput): Promise<RawRow[]> {
  const rows = await db.faq.findMany({
    where,
    select: {
      id: true,
      question: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.question,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchTeamMemberRows(
  where: Prisma.TeamMemberWhereInput,
): Promise<RawRow[]> {
  const rows = await db.teamMember.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.fullName,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

async function fetchMachineryRows(
  where: Prisma.MachineryWhereInput,
): Promise<RawRow[]> {
  const rows = await db.machinery.findMany({
    where,
    select: {
      id: true,
      name: true,
      workflowStatus: true,
      authorId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    workflowStatus: row.workflowStatus,
    authorId: row.authorId,
    updatedAt: row.updatedAt,
  }));
}

const FETCH_BY_TYPE: Record<
  EditorialContentType,
  (where: Record<string, unknown>) => Promise<RawRow[]>
> = {
  service: (where) => fetchServiceRows({ ...notDeleted, ...where }),
  geo_zone: (where) => fetchGeoZoneRows({ ...notDeleted, ...where }),
  service_zone_page: (where) =>
    fetchServiceZonePageRows({ ...notDeleted, ...where }),
  case_study: (where) => fetchCaseStudyRows({ ...notDeleted, ...where }),
  blog_post: (where) => fetchBlogPostRows({ ...notDeleted, ...where }),
  faq: (where) => fetchFaqRows({ ...notDeleted, ...where }),
  team_member: (where) => fetchTeamMemberRows({ ...notDeleted, ...where }),
  machinery: (where) => fetchMachineryRows({ ...notDeleted, ...where }),
};

async function resolveAuthorNames(
  authorIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(authorIds.filter(Boolean))];
  if (unique.length === 0) {
    return new Map();
  }
  const users = await db.user.findMany({
    where: { id: { in: unique }, deletedAt: null },
    select: { id: true, fullName: true },
  });
  return new Map(users.map((user) => [user.id, user.fullName]));
}

/** Listado editorial unificado (GTK-72). */
export async function listCmsContent(filters: CmsFilters) {
  await requirePermission('content.read');

  const types = typesToQuery(filters);
  if (types.length === 0) {
    return {
      items: [] as CmsContentListItem[],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  const statusWhere = buildStatusWhere(filters);

  const batches = await Promise.all(
    types.map(async (contentType) => {
      const raw = await FETCH_BY_TYPE[contentType](statusWhere);
      const meta = getCmsContentTypeMeta(contentType);
      return raw.map((row) => ({
        ...row,
        contentType,
        typeLabel: meta.label,
        silo: meta.silo,
        siloLabel: CMS_SILO_LABELS[meta.silo],
        editHref: meta.editorPath(row.id),
      }));
    }),
  );

  const merged = batches.flat().sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  const total = merged.length;
  const start = (filters.page - 1) * filters.pageSize;
  const pageSlice = merged.slice(start, start + filters.pageSize);

  const authorMap = await resolveAuthorNames(
    pageSlice.map((row) => row.authorId).filter((id): id is string => Boolean(id)),
  );

  const items: CmsContentListItem[] = pageSlice.map((row) => ({
    id: row.id,
    contentType: row.contentType,
    typeLabel: row.typeLabel,
    title: row.title,
    silo: row.silo,
    siloLabel: row.siloLabel,
    workflowStatus: row.workflowStatus,
    authorName: row.authorId ? (authorMap.get(row.authorId) ?? null) : null,
    updatedAt: row.updatedAt,
    editHref: row.editHref,
  }));

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}
