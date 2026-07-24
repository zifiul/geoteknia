/**
 * Tests de lib/audit/log.ts — GTK-22 / audit-log-service spec.
 */
import { AuditAction } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const auditLogCreate = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      create: auditLogCreate,
    },
  },
}));

describe('lib/audit/log — recordAudit (GTK-22)', () => {
  beforeEach(() => {
    vi.resetModules();
    auditLogCreate.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('persiste una fila append-only con todos los campos', async () => {
    auditLogCreate.mockResolvedValue({ id: 'audit-1' });

    const { recordAudit } = await import('@/lib/audit/log');

    const result = await recordAudit({
      userId: '11111111-1111-4111-8111-111111111111',
      action: AuditAction.publish,
      entityType: 'blog_post',
      entityId: '22222222-2222-4222-8222-222222222222',
      ip: '203.0.113.10',
      userAgent: 'vitest-agent',
      metadata: {
        entitySlug: 'sondeos-madrid',
        previousStatus: 'approved',
        workflowStatus: 'published',
        contentType: 'blog_post',
      },
    });

    expect(result).toEqual({ id: 'audit-1' });
    expect(auditLogCreate).toHaveBeenCalledWith({
      data: {
        userId: '11111111-1111-4111-8111-111111111111',
        action: AuditAction.publish,
        entityType: 'blog_post',
        entityId: '22222222-2222-4222-8222-222222222222',
        ipAddress: '203.0.113.10',
        userAgent: 'vitest-agent',
        metadata: {
          entitySlug: 'sondeos-madrid',
          previousStatus: 'approved',
          workflowStatus: 'published',
          contentType: 'blog_post',
        },
      },
    });
  });

  it('acepta userId null para acciones del sistema', async () => {
    auditLogCreate.mockResolvedValue({ id: 'audit-system' });

    const { recordAudit } = await import('@/lib/audit/log');

    const result = await recordAudit({
      userId: null,
      action: AuditAction.login_failed,
      metadata: { method: 'credentials', attemptReason: 'invalid_password' },
    });

    expect(result).toEqual({ id: 'audit-system' });
    expect(auditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null }),
      }),
    );
  });

  it('rechaza action fuera del enum Prisma', async () => {
    const { recordAudit, AuditValidationError } = await import('@/lib/audit/log');

    await expect(
      recordAudit({
        userId: null,
        // @ts-expect-error — acción inválida deliberada para el test
        action: 'invalid_action',
      }),
    ).rejects.toBeInstanceOf(AuditValidationError);

    expect(auditLogCreate).not.toHaveBeenCalled();
  });

  it('SEC-5 (GTK-24): persiste metadata.event en role_change para 2FA', async () => {
    auditLogCreate.mockResolvedValue({ id: 'audit-2fa' });

    const { recordAudit } = await import('@/lib/audit/log');

    await recordAudit({
      userId: '11111111-1111-4111-8111-111111111111',
      action: AuditAction.role_change,
      entityType: 'users',
      entityId: '11111111-1111-4111-8111-111111111111',
      metadata: {
        event: '2fa_enabled',
        targetUserId: '11111111-1111-4111-8111-111111111111',
        twofa_secret: 'must-strip',
      },
    });

    expect(auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: {
          event: '2fa_enabled',
          targetUserId: '11111111-1111-4111-8111-111111111111',
        },
      }),
    });
  });

  it('elimina claves sensibles de metadata antes de persistir', async () => {
    auditLogCreate.mockResolvedValue({ id: 'audit-sanitized' });

    const { recordAudit } = await import('@/lib/audit/log');

    await recordAudit({
      userId: '11111111-1111-4111-8111-111111111111',
      action: AuditAction.login,
      metadata: {
        method: 'credentials',
        roleName: 'admin',
        password: 'secret123',
        totpSecret: 'ABCD',
        email: 'user@example.com',
      },
    });

    expect(auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: {
          method: 'credentials',
          roleName: 'admin',
        },
      }),
    });
  });

  it('propaga error en acciones mustAudit (publish)', async () => {
    auditLogCreate.mockRejectedValue(new Error('db unavailable'));

    const { recordAudit, AuditPersistenceError } = await import('@/lib/audit/log');

    await expect(
      recordAudit({
        userId: '11111111-1111-4111-8111-111111111111',
        action: AuditAction.publish,
        entityType: 'blog_post',
        entityId: '22222222-2222-4222-8222-222222222222',
        metadata: {
          entitySlug: 'post',
          workflowStatus: 'published',
          contentType: 'blog_post',
        },
      }),
    ).rejects.toBeInstanceOf(AuditPersistenceError);
  });

  it('retorna null en best-effort cuando falla la persistencia (login)', async () => {
    auditLogCreate.mockRejectedValue(new Error('db unavailable'));

    const { recordAudit } = await import('@/lib/audit/log');

    const result = await recordAudit({
      userId: '11111111-1111-4111-8111-111111111111',
      action: AuditAction.login,
      metadata: { method: 'credentials', roleName: 'admin' },
    });

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('usa el cliente transaccional cuando se pasa tx', async () => {
    const txCreate = vi.fn().mockResolvedValue({ id: 'audit-tx' });
    const tx = { auditLog: { create: txCreate } };

    auditLogCreate.mockResolvedValue({ id: 'audit-global' });

    const { recordAudit } = await import('@/lib/audit/log');

    const result = await recordAudit(
      {
        userId: '11111111-1111-4111-8111-111111111111',
        action: AuditAction.delete,
        entityType: 'blog_post',
        entityId: '22222222-2222-4222-8222-222222222222',
        metadata: { entitySlug: 'post', softDelete: true },
      },
      { tx: tx as never },
    );

    expect(result).toEqual({ id: 'audit-tx' });
    expect(txCreate).toHaveBeenCalledOnce();
    expect(auditLogCreate).not.toHaveBeenCalled();
  });
});
