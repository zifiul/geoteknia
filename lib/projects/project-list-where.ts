import type { Prisma } from '@prisma/client';

import type { PortalSessionPayload } from '@/lib/auth/session';

import type { ProjectFilters } from './project-filters-schema';

export type ProjectListFilterInput = Pick<
  ProjectFilters,
  'stateSlug' | 'technicianId' | 'serviceSlug' | 'provinceSlug' | 'from' | 'to'
>;

/** Construye el `where` de listado/métricas con scoping por rol (GTK-34 / SEC-2). */
export function buildProjectListWhere(
  user: PortalSessionPayload,
  filters: ProjectListFilterInput,
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { deletedAt: null };

  if (user.roleName === 'tecnico') {
    where.assignedTechnicianId = user.userId;
  } else if (filters.technicianId) {
    where.assignedTechnicianId = filters.technicianId;
  }

  if (filters.stateSlug) {
    where.state = { slug: filters.stateSlug, deletedAt: null };
  }

  if (filters.serviceSlug) {
    where.service = { slug: filters.serviceSlug, deletedAt: null };
  }

  if (filters.provinceSlug) {
    where.province = { slug: filters.provinceSlug, deletedAt: null };
  }

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) {
      where.createdAt.gte = filters.from;
    }
    if (filters.to) {
      where.createdAt.lte = filters.to;
    }
  }

  return where;
}
