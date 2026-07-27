/**
 * GTK-68 — audit access_denied best-effort.
 */
import { AuditAction, RoleName } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const recordAuditMock = vi.fn();

vi.mock('@/lib/audit/log', () => ({
  recordAudit: (...args: unknown[]) => recordAuditMock(...args),
}));

describe('recordAccessDeniedAudit', () => {
  beforeEach(() => {
    recordAuditMock.mockReset();
    recordAuditMock.mockResolvedValue({ id: 'audit-1' });
  });

  it('registra access_denied con metadata mínima', async () => {
    const { recordAccessDeniedAudit } = await import(
      '@/lib/admin/access-denied-audit'
    );
    await recordAccessDeniedAudit(
      {
        userId: '11111111-1111-4111-8111-111111111111',
        roleId: '22222222-2222-4222-8222-222222222222',
        roleName: RoleName.tecnico,
      },
      '/admin/usuarios',
    );

    expect(recordAuditMock).toHaveBeenCalledWith({
      userId: '11111111-1111-4111-8111-111111111111',
      action: AuditAction.access_denied,
      entityType: 'admin_route',
      entityId: null,
      metadata: {
        pathname: '/admin/usuarios',
        roleName: RoleName.tecnico,
      },
    });
  });

  it('no propaga error si recordAudit falla', async () => {
    recordAuditMock.mockRejectedValue(new Error('db down'));

    const { recordAccessDeniedAudit } = await import(
      '@/lib/admin/access-denied-audit'
    );

    await expect(
      recordAccessDeniedAudit(
        {
          userId: '11111111-1111-4111-8111-111111111111',
          roleId: '22222222-2222-4222-8222-222222222222',
          roleName: RoleName.gestor,
        },
        '/contenido',
      ),
    ).resolves.toBeUndefined();
  });
});
