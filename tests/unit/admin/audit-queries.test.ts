/**
 * GTK-80 — listAuditLogs RBAC y filtros.
 */
import { AuditAction } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { requirePermission } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));
const { findMany, count, findFirst, transaction } = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/rbac')>();
  return { ...actual, requirePermission };
});

vi.mock('@/lib/db', () => ({
  db: {
    auditLog: { findMany, count, findFirst },
    $transaction: transaction,
  },
}));

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { AUDIT_SYSTEM_ACTOR_ID } from '@/lib/admin/audit-labels';
import { getAuditLogById, listAuditLogs } from '@/lib/admin/audit-queries';

describe('listAuditLogs (GTK-80 / SEC-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (ops: Promise<unknown>[]) =>
      Promise.all(ops),
    );
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    requirePermission.mockResolvedValue(undefined);
  });

  it('sin audit.read: ForbiddenError antes de Prisma', async () => {
    requirePermission.mockRejectedValue(new ForbiddenError());
    await expect(
      listAuditLogs({ page: 1, pageSize: 25 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('filtra por actor Sistema', async () => {
    await listAuditLogs({
      page: 1,
      pageSize: 10,
      userId: AUDIT_SYSTEM_ACTOR_ID,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: null,
        },
      }),
    );
  });

  it('filtra por action y entityType', async () => {
    await listAuditLogs({
      page: 1,
      pageSize: 10,
      action: AuditAction.login_failed,
      entityType: 'projects',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          action: AuditAction.login_failed,
          entityType: 'projects',
        },
        select: expect.not.objectContaining({ metadata: expect.anything() }),
      }),
    );
  });

  it('ordena por createdAt desc', async () => {
    await listAuditLogs({ page: 1, pageSize: 25 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }],
      }),
    );
  });
});

describe('getAuditLogById (GTK-80)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue(undefined);
  });

  it('incluye metadata en detalle', async () => {
    findFirst.mockResolvedValue({
      id: 'a1',
      metadata: { method: 'credentials' },
      action: AuditAction.login,
      createdAt: new Date(),
      entityType: null,
      entityId: null,
      ipAddress: '1.1.1.1',
      userAgent: 'ua',
      userId: null,
      user: null,
    });
    const row = await getAuditLogById('a1');
    expect(row.metadata).toEqual({ method: 'credentials' });
  });
});
