/**
 * Validez del espejo de sesión y requireSession — GTK-23 / SEC-4, SEC-5.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  evaluateSessionMirror,
  requireSession,
} from '@/lib/auth/session';
const future = new Date(Date.now() + 60_000);
const past = new Date(Date.now() - 60_000);

describe('evaluateSessionMirror (GTK-23 / SEC-4)', () => {
  it('sesión válida cuando no revocada y no expirada', () => {
    expect(
      evaluateSessionMirror(
        { revokedAt: null, expiresAt: future },
        new Date(),
      ),
    ).toBe('valid');
  });

  it('sesión revocada', () => {
    expect(
      evaluateSessionMirror(
        { revokedAt: new Date(), expiresAt: future },
        new Date(),
      ),
    ).toBe('revoked');
  });

  it('sesión expirada', () => {
    expect(
      evaluateSessionMirror(
        { revokedAt: null, expiresAt: past },
        new Date(),
      ),
    ).toBe('expired');
  });

  it('sin fila en BD', () => {
    expect(evaluateSessionMirror(null, new Date())).toBe('missing');
  });
});

describe('requireSession (GTK-23 / SEC-4)', () => {
  it('devuelve payload cuando auth y espejo válidos', async () => {
    const sessionPayload = {
      userId: '11111111-1111-4111-8111-111111111111',
      roleId: '22222222-2222-4222-8222-222222222222',
      roleName: 'admin' as const,
      sessionTokenHash: 'hash-abc',
    };

    const result = await requireSession({
      getAuthSession: vi.fn().mockResolvedValue(sessionPayload),
      findSessionMirror: vi
        .fn()
        .mockResolvedValue({ revokedAt: null, expiresAt: future }),
      now: new Date(),
    });

    expect(result).toEqual({
      userId: sessionPayload.userId,
      roleId: sessionPayload.roleId,
      roleName: 'admin',
    });
  });

  it('rechaza sesión revocada en BD', async () => {
    await expect(
      requireSession({
        getAuthSession: vi.fn().mockResolvedValue({
          userId: '11111111-1111-4111-8111-111111111111',
          roleId: '22222222-2222-4222-8222-222222222222',
          roleName: 'editor',
          sessionTokenHash: 'hash-revoked',
        }),
        findSessionMirror: vi.fn().mockResolvedValue({
          revokedAt: new Date(),
          expiresAt: future,
        }),
        now: new Date(),
      }),
    ).rejects.toThrow(/sesión/i);
  });

  it('rechaza sesión expirada en BD', async () => {
    await expect(
      requireSession({
        getAuthSession: vi.fn().mockResolvedValue({
          userId: '11111111-1111-4111-8111-111111111111',
          roleId: '22222222-2222-4222-8222-222222222222',
          roleName: 'editor',
          sessionTokenHash: 'hash-expired',
        }),
        findSessionMirror: vi.fn().mockResolvedValue({
          revokedAt: null,
          expiresAt: past,
        }),
        now: new Date(),
      }),
    ).rejects.toThrow(/sesión/i);
  });
});
