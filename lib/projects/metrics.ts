import 'server-only';

import { Prisma } from '@prisma/client';

import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

import type { ProjectFilters } from './project-filters-schema';
import { buildProjectListWhere } from './project-list-where';

export type PipelineMetrics = {
  byService: Array<{ serviceId: string | null; label: string; count: number }>;
  byProvince: Array<{ provinceId: string | null; label: string; count: number }>;
  qualificationRate: number | null;
  avgFirstResponseHours: number | null;
};

export async function getPipelineMetrics(
  filters: ProjectFilters,
): Promise<PipelineMetrics> {
  const user = await requirePermission('projects.read');
  const where = buildProjectListWhere(user, filters);

  const [byServiceRaw, byProvinceRaw, qualifiedCount, totalCount] =
    await db.$transaction([
      db.project.groupBy({
        by: ['serviceId'],
        where,
        _count: { _all: true },
        orderBy: { serviceId: 'asc' },
      }),
      db.project.groupBy({
        by: ['provinceId'],
        where,
        _count: { _all: true },
        orderBy: { provinceId: 'asc' },
      }),
      db.project.count({ where: { ...where, isQualified: true } }),
      db.project.count({ where }),
    ]);

  const avgFirstResponseHours = await computeAvgFirstResponseHours(where);

  const serviceIds = byServiceRaw
    .map((row) => row.serviceId)
    .filter((id): id is string => id !== null);
  const provinceIds = byProvinceRaw
    .map((row) => row.provinceId)
    .filter((id): id is string => id !== null);

  const [services, provinces] = await Promise.all([
    serviceIds.length
      ? db.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    provinceIds.length
      ? db.province.findMany({
          where: { id: { in: provinceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const serviceNameById = new Map(services.map((s) => [s.id, s.name]));
  const provinceNameById = new Map(provinces.map((p) => [p.id, p.name]));

  const byService = byServiceRaw.map((row) => ({
    serviceId: row.serviceId,
    label: row.serviceId
      ? (serviceNameById.get(row.serviceId) ?? 'Servicio desconocido')
      : 'Sin servicio',
    count: row._count._all,
  }));

  const byProvince = byProvinceRaw.map((row) => ({
    provinceId: row.provinceId,
    label: row.provinceId
      ? (provinceNameById.get(row.provinceId) ?? 'Provincia desconocida')
      : 'Sin provincia',
    count: row._count._all,
  }));

  const qualificationRate =
    totalCount === 0 ? null : qualifiedCount / totalCount;

  return {
    byService,
    byProvince,
    qualificationRate,
    avgFirstResponseHours,
  };
}

async function computeAvgFirstResponseHours(
  where: Prisma.ProjectWhereInput,
): Promise<number | null> {
  const scopedIds = await db.project.findMany({
    where: { ...where, firstResponseAt: { not: null } },
    select: { id: true },
  });

  if (scopedIds.length === 0) {
    return null;
  }

  const ids = scopedIds.map((row) => row.id);
  const rows = await db.$queryRaw<Array<{ avg_hours: number | null }>>(
    Prisma.sql`
      SELECT AVG(
        EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600.0
      )::float AS avg_hours
      FROM projects
      WHERE id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))})
        AND first_response_at IS NOT NULL
        AND deleted_at IS NULL
    `,
  );

  const avg = rows[0]?.avg_hours;
  return avg === null || avg === undefined ? null : Number(avg);
}
