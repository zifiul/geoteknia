import 'server-only';

import type { Prisma } from '@prisma/client';

import type { AuditFilters } from '@/lib/admin/audit-filters-schema';
import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

const listSelect = {
  id: true,
  createdAt: true,
  action: true,
  entityType: true,
  entityId: true,
  ipAddress: true,
  userId: true,
  user: { select: { fullName: true } },
} satisfies Prisma.AuditLogSelect;

export type AuditLogListItem = Prisma.AuditLogGetPayload<{
  select: typeof listSelect;
}>;

const detailSelect = {
  id: true,
  createdAt: true,
  action: true,
  entityType: true,
  entityId: true,
  ipAddress: true,
  userAgent: true,
  metadata: true,
  userId: true,
  user: { select: { fullName: true } },
} satisfies Prisma.AuditLogSelect;

export type AuditLogDetail = Prisma.AuditLogGetPayload<{
  select: typeof detailSelect;
}>;

export class AuditLogNotFoundError extends Error {
  constructor() {
    super('Evento de auditoría no encontrado');
    this.name = 'AuditLogNotFoundError';
  }
}

function buildAuditListWhere(filters: AuditFilters): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.userId) {
    where.userId = filters.userId;
  }
  if (filters.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters.entityId) {
    where.entityId = filters.entityId;
  }
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) {
      where.createdAt.gte = filters.from;
    }
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  return where;
}

export async function listAuditLogs(filters: AuditFilters) {
  await requirePermission('audit.read');

  const where = buildAuditListWhere(filters);
  const orderBy: Prisma.AuditLogOrderByWithRelationInput[] = [
    { createdAt: 'desc' },
  ];

  const [items, total] = await db.$transaction([
    db.auditLog.findMany({
      where,
      select: listSelect,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getAuditLogById(id: string): Promise<AuditLogDetail> {
  await requirePermission('audit.read');

  const row = await db.auditLog.findFirst({
    where: { id },
    select: detailSelect,
  });

  if (!row) {
    throw new AuditLogNotFoundError();
  }

  return row;
}
