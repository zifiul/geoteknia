/**
 * Verificador TOTP registrado — GTK-24
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findFirst = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    user: { findFirst },
  },
}));

const decryptSecret = vi.fn();
vi.mock('@/lib/auth/crypto', () => ({
  decryptSecret: (...args: unknown[]) => decryptSecret(...args),
}));

const verifyTotpCode = vi.fn();
vi.mock('@/lib/auth/totp-core', () => ({
  verifyTotpCode: (...args: unknown[]) => verifyTotpCode(...args),
}));

describe('lib/auth/totp-verifier (GTK-24)', () => {
  beforeEach(() => {
    vi.resetModules();
    findFirst.mockReset();
    decryptSecret.mockReset();
    verifyTotpCode.mockReset();
  });

  it('registra verificador y valida contra secreto cifrado', async () => {
    findFirst.mockResolvedValue({
      twofaSecret: 'cipher',
      twofaEnabled: true,
    });
    decryptSecret.mockReturnValue('PLAINSECRET');
    verifyTotpCode.mockResolvedValue(true);

    const totp = await import('@/lib/auth/totp');
    expect(totp.isTotpVerifierAvailable()).toBe(false);

    await import('@/lib/auth/totp-verifier');

    expect(totp.isTotpVerifierAvailable()).toBe(true);
    await expect(totp.verifyTotp('user-id', '123456')).resolves.toBe(true);
    expect(decryptSecret).toHaveBeenCalledWith('cipher');
  });

  it('devuelve false si el usuario no tiene 2FA activo', async () => {
    findFirst.mockResolvedValue({
      twofaSecret: null,
      twofaEnabled: false,
    });

    await import('@/lib/auth/totp-verifier');
    const { verifyTotp } = await import('@/lib/auth/totp');

    await expect(verifyTotp('user-id', '123456')).resolves.toBe(false);
  });
});
