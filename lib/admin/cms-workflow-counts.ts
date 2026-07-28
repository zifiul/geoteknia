import 'server-only';

import { WorkflowStatus } from '@prisma/client';

import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

export type CmsWorkflowTotals = {
  borradorIa: number;
  enRevision: number;
  programados: number;
  publicadosRecientes: number;
};

const notDeleted = { deletedAt: null };
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type GroupRow = {
  workflowStatus: WorkflowStatus;
  _count: { _all: number };
};

function rowsToMap(rows: GroupRow[]): Map<WorkflowStatus, number> {
  const map = new Map<WorkflowStatus, number>();
  for (const row of rows) {
    map.set(row.workflowStatus, row._count._all);
  }
  return map;
}

function workflowGroupByArgs() {
  return {
    by: ['workflowStatus'] as ['workflowStatus'],
    where: notDeleted,
    _count: { _all: true as const },
  };
}

function sumStatus(maps: Map<WorkflowStatus, number>[], status: WorkflowStatus): number {
  return maps.reduce((acc, map) => acc + (map.get(status) ?? 0), 0);
}

/** Agrega conteos CMS en los 8 modelos editoriales (GTK-79). */
export async function getCmsWorkflowTotals(): Promise<CmsWorkflowTotals> {
  await requirePermission('content.read');

  const sevenDaysAgo = new Date(Date.now() - 7 * MS_PER_DAY);

  const groupMaps = await Promise.all([
    db.service.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.geoZone.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.serviceZonePage.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.caseStudy.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.blogPost.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.faq.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.teamMember.groupBy(workflowGroupByArgs()).then(rowsToMap),
    db.machinery.groupBy(workflowGroupByArgs()).then(rowsToMap),
  ]);

  const scheduledWhere = {
    ...notDeleted,
    scheduledPublishAt: { not: null },
    workflowStatus: WorkflowStatus.aprobado,
  };

  const scheduledCounts = await Promise.all([
    db.service.count({ where: scheduledWhere }),
    db.geoZone.count({ where: scheduledWhere }),
    db.serviceZonePage.count({ where: scheduledWhere }),
    db.caseStudy.count({ where: scheduledWhere }),
    db.blogPost.count({ where: scheduledWhere }),
    db.faq.count({ where: scheduledWhere }),
    db.teamMember.count({ where: scheduledWhere }),
    db.machinery.count({ where: scheduledWhere }),
  ]);

  const publishedWhere = {
    ...notDeleted,
    workflowStatus: WorkflowStatus.publicado,
    publishedAt: { gte: sevenDaysAgo },
  };

  const publishedCounts = await Promise.all([
    db.service.count({ where: publishedWhere }),
    db.geoZone.count({ where: publishedWhere }),
    db.serviceZonePage.count({ where: publishedWhere }),
    db.caseStudy.count({ where: publishedWhere }),
    db.blogPost.count({ where: publishedWhere }),
    db.faq.count({ where: publishedWhere }),
    db.teamMember.count({ where: publishedWhere }),
    db.machinery.count({ where: publishedWhere }),
  ]);

  return {
    borradorIa: sumStatus(groupMaps, WorkflowStatus.borrador_ia),
    enRevision: sumStatus(groupMaps, WorkflowStatus.en_revision),
    programados: scheduledCounts.reduce((a, b) => a + b, 0),
    publicadosRecientes: publishedCounts.reduce((a, b) => a + b, 0),
  };
}

/** Borradores IA sin pasar a revisión tras 7 días (alerta editorial). */
export async function countStaleAiDrafts(): Promise<number> {
  await requirePermission('content.read');
  const staleBefore = new Date(Date.now() - 7 * MS_PER_DAY);
  const where = {
    ...notDeleted,
    workflowStatus: WorkflowStatus.borrador_ia,
    createdAt: { lte: staleBefore },
  };

  const counts = await Promise.all([
    db.service.count({ where }),
    db.geoZone.count({ where }),
    db.serviceZonePage.count({ where }),
    db.caseStudy.count({ where }),
    db.blogPost.count({ where }),
    db.faq.count({ where }),
    db.teamMember.count({ where }),
    db.machinery.count({ where }),
  ]);

  return counts.reduce((a, b) => a + b, 0);
}

