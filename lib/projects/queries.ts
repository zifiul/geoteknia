import 'server-only';

import type { Prisma } from '@prisma/client';

import { assertOwnership, requirePermission } from '@/lib/auth/rbac';
import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { db } from '@/lib/db';

import { ProjectNotFoundError } from './errors';
import type { ProjectFilters } from './project-filters-schema';
import { buildProjectListWhere } from './project-list-where';

const listSelect = {
  id: true,
  title: true,
  estimatedValue: true,
  isQualified: true,
  createdAt: true,
  state: { select: { name: true, slug: true, order: true } },
  assignedTechnician: { select: { id: true, fullName: true } },
  service: { select: { name: true, slug: true } },
  province: { select: { name: true, slug: true } },
} satisfies Prisma.ProjectSelect;

export type ProjectListItem = Prisma.ProjectGetPayload<{ select: typeof listSelect }>;

export async function listProjects(filters: ProjectFilters) {
  const user = await requirePermission('projects.read');
  const where = buildProjectListWhere(user, filters);

  const [items, total] = await db.$transaction([
    db.project.findMany({
      where,
      select: listSelect,
      orderBy: [{ state: { order: 'asc' } }, { createdAt: 'desc' }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    db.project.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

const detailInclude = {
  lead: true,
  contact: true,
  state: true,
  assignedTechnician: { select: { id: true, fullName: true } },
  service: true,
  province: true,
  workTypology: true,
  milestones: {
    where: { deletedAt: null },
    orderBy: { dueDate: 'asc' },
  },
  notes: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  },
  documents: {
    where: { deletedAt: null },
  },
  stateHistory: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.ProjectInclude;

export type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof detailInclude }>;

export async function getProjectDetail(id: string): Promise<ProjectDetail> {
  const user = await requirePermission('projects.read');

  const project = await db.project.findFirst({
    where: { id, deletedAt: null },
    include: detailInclude,
  });

  if (!project) {
    throw new ProjectNotFoundError();
  }

  try {
    assertOwnership(project, user);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw new ProjectNotFoundError();
    }
    throw error;
  }

  return project;
}
