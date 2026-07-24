/**
 * GTK-35 — transiciones, RBAC y auditoría (SEC-1–SEC-6).
 */
import { AuditAction } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { recordAudit, transaction, projectFindFirst, projectUpdate, projectUpdateMany, stateFindFirst, stateFindUnique, historyCreate } =
  vi.hoisted(() => ({
    recordAudit: vi.fn(),
    transaction: vi.fn(),
    projectFindFirst: vi.fn(),
    projectUpdate: vi.fn(),
    projectUpdateMany: vi.fn(),
    stateFindFirst: vi.fn(),
    stateFindUnique: vi.fn(),
    historyCreate: vi.fn(),
  }));

vi.mock('@/lib/audit/log', () => ({
  recordAudit,
}));

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: transaction,
  },
}));

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { assertOwnership } from '@/lib/auth/rbac';
import {
  InvalidTransitionError,
  ProjectNotFoundError,
} from '@/lib/projects/errors';
import { changeProjectState } from '@/lib/projects/transitions';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ID = '22222222-2222-4222-8222-222222222222';
const STATE_A = '33333333-3333-4333-8333-333333333333';
const STATE_B = '44444444-4444-4444-8444-444444444444';

function makeTx() {
  return {
    project: {
      findFirst: projectFindFirst,
      update: projectUpdate,
      updateMany: projectUpdateMany,
    },
    projectState: {
      findFirst: stateFindFirst,
      findUnique: stateFindUnique,
    },
    projectStateHistory: { create: historyCreate },
  };
}

function gestorUser() {
  return {
    userId: USER_ID,
    roleId: '55555555-5555-4555-8555-555555555555',
    roleName: 'gestor' as const,
  };
}

describe('changeProjectState (GTK-35)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAudit.mockResolvedValue({ id: 'audit-1' });
    transaction.mockImplementation(async (fn: (tx: ReturnType<typeof makeTx>) => Promise<void>) =>
      fn(makeTx()),
    );
    projectFindFirst.mockResolvedValue({
      id: PROJECT_ID,
      stateId: STATE_A,
      assignedTechnicianId: null,
    });
    stateFindFirst.mockResolvedValue({
      id: STATE_B,
      slug: 'cualificado',
      isTerminal: false,
    });
    stateFindUnique.mockResolvedValue({
      id: STATE_A,
      slug: 'lead-nuevo',
      isTerminal: false,
    });
    projectUpdate.mockResolvedValue({});
    projectUpdateMany.mockResolvedValue({ count: 1 });
    historyCreate.mockResolvedValue({ id: 'h1' });
  });

  it('transición válida: update + history + audit state_change', async () => {
    await changeProjectState(gestorUser(), PROJECT_ID, {
      toStateSlug: 'cualificado',
    });

    expect(projectUpdate).toHaveBeenCalledWith({
      where: { id: PROJECT_ID },
      data: { stateId: STATE_B },
    });
    expect(historyCreate).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.state_change,
        metadata: { fromState: 'lead-nuevo', toState: 'cualificado' },
      }),
      expect.objectContaining({ tx: expect.anything() }),
    );
  });

  it('desde terminal: InvalidTransitionError sin writes', async () => {
    stateFindUnique.mockResolvedValue({
      id: STATE_A,
      slug: 'entregado',
      isTerminal: true,
    });

    await expect(
      changeProjectState(gestorUser(), PROJECT_ID, { toStateSlug: 'cualificado' }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);

    expect(projectUpdate).not.toHaveBeenCalled();
    expect(historyCreate).not.toHaveBeenCalled();
    expect(recordAudit).not.toHaveBeenCalled();
  });

  it('mismo estado: InvalidTransitionError', async () => {
    stateFindFirst.mockResolvedValue({
      id: STATE_A,
      slug: 'lead-nuevo',
      isTerminal: false,
    });

    await expect(
      changeProjectState(gestorUser(), PROJECT_ID, { toStateSlug: 'lead-nuevo' }),
    ).rejects.toBeInstanceOf(InvalidTransitionError);
  });

  it('proyecto inexistente: ProjectNotFoundError', async () => {
    projectFindFirst.mockResolvedValue(null);
    await expect(
      changeProjectState(gestorUser(), PROJECT_ID, { toStateSlug: 'cualificado' }),
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it('tecnico ajeno: ForbiddenError (SEC-2)', async () => {
    projectFindFirst.mockResolvedValue({
      id: PROJECT_ID,
      stateId: STATE_A,
      assignedTechnicianId: 'otro-user',
    });

    await expect(
      changeProjectState(
        { userId: USER_ID, roleId: 'r', roleName: 'tecnico' },
        PROJECT_ID,
        { toStateSlug: 'cualificado' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('fallo de audit mustAudit revierte la transacción (SEC-5)', async () => {
    recordAudit.mockRejectedValue(new Error('db down'));
    await expect(
      changeProjectState(gestorUser(), PROJECT_ID, { toStateSlug: 'cualificado' }),
    ).rejects.toThrow();
  });
});

describe('assertOwnership tecnico (GTK-35 / SEC-3)', () => {
  it('tecnico sin assign no aplica aquí — assign usa projects.assign en action', () => {
    expect(() =>
      assertOwnership(
        { assignedTechnicianId: USER_ID },
        { userId: USER_ID, roleId: 'r', roleName: 'tecnico' },
      ),
    ).not.toThrow();
  });
});
