import 'server-only';

import type { Prisma } from '@prisma/client';

import type { UserFilters } from '@/lib/admin/user-filters-schema';
import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

const listSelect = {
  id: true,
  fullName: true,
  email: true,
  isActive: true,
  twofaEnabled: true,
  lastLoginAt: true,
  createdAt: true,
  role: { select: { id: true, name: true, label: true } },
} satisfies Prisma.UserSelect;

export type UserListItem = Prisma.UserGetPayload<{ select: typeof listSelect }>;

function buildUserListWhere(filters: UserFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (filters.role) {
    where.role = { name: filters.role };
  }
  if (filters.active !== undefined) {
    where.isActive = filters.active;
  }
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: 'insensitive' } },
      { email: { contains: filters.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function listUsers(filters: UserFilters) {
  await requirePermission('users.read');
  const where = buildUserListWhere(filters);
  const orderBy: Prisma.UserOrderByWithRelationInput[] =
    filters.sort === 'createdAt'
      ? [{ createdAt: 'desc' }]
      : [{ fullName: 'asc' }];

  const [items, total] = await db.$transaction([
    db.user.findMany({
      where,
      select: listSelect,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    db.user.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

const detailSelect = {
  id: true,
  fullName: true,
  email: true,
  isActive: true,
  twofaEnabled: true,
  lastLoginAt: true,
  createdAt: true,
  roleId: true,
  role: { select: { id: true, name: true, label: true } },
} satisfies Prisma.UserSelect;

export type UserDetail = Prisma.UserGetPayload<{ select: typeof detailSelect }>;

export class UserNotFoundError extends Error {
  constructor() {
    super('Usuario no encontrado');
    this.name = 'UserNotFoundError';
  }
}

export async function listAssignableRoles() {
  await requirePermission('users.read');
  return db.role.findMany({
    select: { id: true, name: true, label: true },
    orderBy: { name: 'asc' },
  });
}

export async function getUserDetail(userId: string): Promise<UserDetail> {
  await requirePermission('users.read');

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: detailSelect,
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
}

export async function countOtherActiveAdmins(
  excludeUserId: string,
): Promise<number> {
  return db.user.count({
    where: {
      deletedAt: null,
      isActive: true,
      id: { not: excludeUserId },
      role: { name: 'admin' },
    },
  });
}
