import 'server-only';

import { AUDIT_ENTITY_TYPE_LABELS } from '@/lib/admin/audit-labels';
import { db } from '@/lib/db';

export type AuditEntityRef = {
  entityType: string;
  entityId: string;
};

export function auditEntityKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function fallbackLabel(entityType: string, entityId: string): string {
  const typeLabel = AUDIT_ENTITY_TYPE_LABELS[entityType] ?? entityType;
  return `${typeLabel} · ${shortId(entityId)}`;
}

async function loadProjectTitles(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.project.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  return new Map(rows.map((row) => [row.id, row.title]));
}

async function loadUserNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, fullName: true },
  });
  return new Map(rows.map((row) => [row.id, row.fullName]));
}

async function loadServiceNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.service.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  return new Map(rows.map((row) => [row.id, row.name]));
}

async function loadGeoZoneNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.geoZone.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  return new Map(rows.map((row) => [row.id, row.name]));
}

async function loadServiceZonePageNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.serviceZonePage.findMany({
    where: { id: { in: ids } },
    select: { id: true, h1: true, slug: true },
  });
  return new Map(
    rows.map((row) => [row.id, row.h1?.trim() || row.slug]),
  );
}

async function loadCaseStudyTitles(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.caseStudy.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  return new Map(rows.map((row) => [row.id, row.title]));
}

async function loadBlogPostTitles(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.blogPost.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  return new Map(rows.map((row) => [row.id, row.title]));
}

async function loadFaqQuestions(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.faq.findMany({
    where: { id: { in: ids } },
    select: { id: true, question: true },
  });
  return new Map(rows.map((row) => [row.id, row.question]));
}

async function loadTeamMemberNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.teamMember.findMany({
    where: { id: { in: ids } },
    select: { id: true, fullName: true },
  });
  return new Map(rows.map((row) => [row.id, row.fullName]));
}

async function loadMachineryNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.machinery.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  return new Map(rows.map((row) => [row.id, row.name]));
}

async function loadMediaTitles(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db.mediaAsset.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, fileUrl: true },
  });
  return new Map(
    rows.map((row) => [row.id, row.title?.trim() || row.fileUrl]),
  );
}

const ENTITY_LOADERS: Record<
  string,
  (ids: string[]) => Promise<Map<string, string>>
> = {
  projects: loadProjectTitles,
  project: loadProjectTitles,
  users: loadUserNames,
  user: loadUserNames,
  service: loadServiceNames,
  geo_zone: loadGeoZoneNames,
  service_zone_page: loadServiceZonePageNames,
  case_study: loadCaseStudyTitles,
  blog_post: loadBlogPostTitles,
  faq: loadFaqQuestions,
  team_member: loadTeamMemberNames,
  machinery: loadMachineryNames,
  media_asset: loadMediaTitles,
};

/** Resuelve etiquetas legibles para pares entityType/entityId de audit_logs. */
export async function resolveAuditEntityLabels(
  refs: AuditEntityRef[],
): Promise<Map<string, string>> {
  const labels = new Map<string, string>();
  if (refs.length === 0) {
    return labels;
  }

  const idsByType = new Map<string, string[]>();
  for (const ref of refs) {
    const bucket = idsByType.get(ref.entityType) ?? [];
    bucket.push(ref.entityId);
    idsByType.set(ref.entityType, bucket);
  }

  const resolvedByType = await Promise.all(
    [...idsByType.entries()].map(async ([entityType, ids]) => {
      const loader = ENTITY_LOADERS[entityType];
      if (!loader) {
        return new Map<string, string>();
      }
      return loader([...new Set(ids)]);
    }),
  );

  const resolved = new Map<string, string>();
  let index = 0;
  for (const [entityType] of idsByType) {
    const typeLabels = resolvedByType[index++] ?? new Map();
    for (const [id, label] of typeLabels) {
      resolved.set(auditEntityKey(entityType, id), label);
    }
  }

  for (const ref of refs) {
    const key = auditEntityKey(ref.entityType, ref.entityId);
    labels.set(key, resolved.get(key) ?? fallbackLabel(ref.entityType, ref.entityId));
  }

  return labels;
}
