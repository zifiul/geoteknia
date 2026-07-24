/**
 * Auditoría de login — GTK-23 / SEC-2, SEC-7 (vía GTK-22).
 */
import { AuditAction } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  recordLoginFailedAudit,
  recordLoginSuccessAudit,
} from '@/lib/auth/login-audit';
describe('lib/auth/login-audit (GTK-23 / SEC-2, SEC-7)', () => {
  it('SEC-7: login exitoso llama recordAudit con action login', async () => {
    const recordAudit = vi.fn().mockResolvedValue({ id: 'a1' });

    await recordLoginSuccessAudit(
      {
        userId: '11111111-1111-4111-8111-111111111111',
        roleName: 'admin',
        ip: '203.0.113.1',
        userAgent: 'vitest',
      },
      { recordAudit },
    );

    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '11111111-1111-4111-8111-111111111111',
        action: AuditAction.login,
        entityType: 'users',
        metadata: { method: 'credentials', roleName: 'admin' },
      }),
    );
  });

  it('SEC-7: login_failed con attemptReason', async () => {
    const recordAudit = vi.fn().mockResolvedValue({ id: 'a2' });

    await recordLoginFailedAudit(
      {
        userId: null,
        attemptReason: 'user_not_found',
        ip: '203.0.113.2',
        userAgent: 'vitest',
      },
      { recordAudit },
    );

    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.login_failed,
        metadata: { method: 'credentials', attemptReason: 'user_not_found' },
      }),
    );
  });

  it('SEC-2: no incluye password ni totp en metadata de login', async () => {
    const recordAudit = vi.fn().mockResolvedValue({ id: 'a3' });

    await recordLoginSuccessAudit(
      {
        userId: '11111111-1111-4111-8111-111111111111',
        roleName: 'gestor',
        ip: '203.0.113.3',
        userAgent: 'vitest',
      },
      { recordAudit },
    );

    const call = recordAudit.mock.calls[0]?.[0];
    expect(call?.metadata).toBeDefined();
    expect(JSON.stringify(call?.metadata)).not.toMatch(/password|totp|secret/i);
  });
});
