/**
 * GTK-34 — queries RBAC y detalle (SEC-1, SEC-3, SEC-5).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { requirePermission } = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));
const { findFirst, findMany, count, transaction } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/auth/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/session')>();
  return { ...actual, getPortalSession: vi.fn() };
});

vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/rbac')>();
  return {
    ...actual,
    requirePermission,
  };
});

vi.mock('@/lib/db', () => ({
  db: {
    project: { findFirst, findMany, count },
    $transaction: transaction,
  },
}));

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { ProjectNotFoundError } from '@/lib/projects/errors';
import { getProjectDetail, listProjects } from '@/lib/projects/queries';

const TECH_UUID = '11111111-1111-4111-8111-111111111111';

function makeUser(roleName: 'admin' | 'gestor' | 'editor' | 'tecnico') {
  return {
    userId: TECH_UUID,
    roleId: '22222222-2222-4222-8222-222222222222',
    roleName,
  };
}

describe('listProjects RBAC (GTK-34 / SEC-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (ops: Promise<unknown>[]) =>
      Promise.all(ops),
    );
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
  });

  it('editor sin projects.read: ForbiddenError antes de Prisma', async () => {
    requirePermission.mockRejectedValue(new ForbiddenError());
    await expect(
      listProjects({ page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(transaction).not.toHaveBeenCalled();
  });
});

describe('getProjectDetail (GTK-34 / SEC-3, SEC-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue(makeUser('tecnico'));
  });

  it('proyecto soft-deleted: ProjectNotFoundError', async () => {
    findFirst.mockResolvedValue(null);
    await expect(getProjectDetail('pid')).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it('tecnico ajeno: ProjectNotFoundError (anti-enumeración)', async () => {
    findFirst.mockResolvedValue({
      id: 'pid',
      assignedTechnicianId: 'otro-tecnico',
    });
    await expect(getProjectDetail('pid')).rejects.toBeInstanceOf(
      ProjectNotFoundError,
    );
  });

  it('tecnico dueño: devuelve el proyecto', async () => {
    const project = {
      id: 'pid',
      assignedTechnicianId: TECH_UUID,
      title: 'Test',
    };
    findFirst.mockResolvedValue(project);
    await expect(getProjectDetail('pid')).resolves.toBe(project);
  });
});
