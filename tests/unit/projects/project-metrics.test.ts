/**
 * GTK-34 — getPipelineMetrics.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { requirePermission } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));
const { groupBy, count, findMany, serviceFindMany, provinceFindMany, queryRaw, transaction } =
  vi.hoisted(() => ({
    groupBy: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    serviceFindMany: vi.fn(),
    provinceFindMany: vi.fn(),
    queryRaw: vi.fn(),
    transaction: vi.fn(),
  }));

vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/rbac')>();
  return { ...actual, requirePermission };
});

vi.mock('@/lib/db', () => ({
  db: {
    project: { groupBy, count, findMany },
    service: { findMany: serviceFindMany },
    province: { findMany: provinceFindMany },
    $transaction: transaction,
    $queryRaw: queryRaw,
  },
}));

import { getPipelineMetrics } from '@/lib/projects/metrics';

describe('getPipelineMetrics (GTK-34)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
      roleId: '22222222-2222-4222-8222-222222222222',
      roleName: 'admin',
    });
    groupBy.mockResolvedValue([]);
    count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    findMany.mockResolvedValue([]);
    serviceFindMany.mockResolvedValue([]);
    provinceFindMany.mockResolvedValue([]);
    transaction.mockImplementation(async (promises: Promise<unknown>[]) =>
      Promise.all(promises),
    );
    queryRaw.mockResolvedValue([{ avg_hours: null }]);
  });

  it('qualificationRate null sin proyectos', async () => {
    const metrics = await getPipelineMetrics({ page: 1, pageSize: 20 });
    expect(metrics.qualificationRate).toBeNull();
    expect(metrics.avgFirstResponseHours).toBeNull();
  });

  it('calcula tasa de cualificación', async () => {
    count.mockReset();
    count.mockResolvedValueOnce(2).mockResolvedValueOnce(4);
    findMany.mockResolvedValue([]);

    const metrics = await getPipelineMetrics({ page: 1, pageSize: 20 });
    expect(metrics.qualificationRate).toBe(0.5);
  });

  it('tiempo medio desde $queryRaw cuando hay ids', async () => {
    count.mockReset();
    count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    findMany.mockResolvedValue([{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }]);
    queryRaw.mockResolvedValue([{ avg_hours: 12.5 }]);

    const metrics = await getPipelineMetrics({ page: 1, pageSize: 20 });
    expect(metrics.avgFirstResponseHours).toBe(12.5);
    expect(queryRaw).toHaveBeenCalled();
  });
});
