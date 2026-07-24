/**
 * Caso de uso authenticateCredentials — GTK-23 / SEC-1, SEC-3.
 */
import { describe, expect, it, vi } from 'vitest';
import { authenticateCredentials } from '@/lib/auth/authenticate-credentials';

const baseUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'editor@geoteknia.test',
  passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$fake',
  isActive: true,
  twofaEnabled: false,
  roleId: '22222222-2222-4222-8222-222222222222',
  roleName: 'editor' as const,
};

describe('authenticateCredentials (GTK-23)', () => {
  it('usuario activo con credenciales correctas → ok', async () => {
    const findUserByEmail = vi.fn().mockResolvedValue(baseUser);
    const verifyPassword = vi.fn().mockResolvedValue(true);

    const result = await authenticateCredentials(
      { email: baseUser.email, password: 'ValidPass1!' },
      { findUserByEmail, verifyPassword, isTotpVerifierAvailable: () => false },
    );

    expect(result).toEqual({
      ok: true,
      user: {
        id: baseUser.id,
        email: baseUser.email,
        roleId: baseUser.roleId,
        roleName: 'editor',
      },
    });
  });

  it('usuario inactivo → invalid_credentials (SEC-1 genérico)', async () => {
    const result = await authenticateCredentials(
      { email: baseUser.email, password: 'ValidPass1!' },
      {
        findUserByEmail: vi
          .fn()
          .mockResolvedValue({ ...baseUser, isActive: false }),
        verifyPassword: vi.fn().mockResolvedValue(true),
        isTotpVerifierAvailable: () => false,
      },
    );

    expect(result).toMatchObject({ ok: false, reason: 'invalid_credentials' });
  });

  it('contraseña incorrecta → invalid_credentials', async () => {
    const result = await authenticateCredentials(
      { email: baseUser.email, password: 'WrongPass1!' },
      {
        findUserByEmail: vi.fn().mockResolvedValue(baseUser),
        verifyPassword: vi.fn().mockResolvedValue(false),
        isTotpVerifierAvailable: () => false,
      },
    );

    expect(result).toMatchObject({ ok: false, reason: 'invalid_credentials' });
  });

  it('usuario inexistente → invalid_credentials', async () => {
    const result = await authenticateCredentials(
      { email: 'missing@geoteknia.test', password: 'ValidPass1!' },
      {
        findUserByEmail: vi.fn().mockResolvedValue(null),
        verifyPassword: vi.fn(),
        isTotpVerifierAvailable: () => false,
      },
    );

    expect(result).toMatchObject({ ok: false, reason: 'invalid_credentials' });
    expect(result.ok === false && result.reason).toBe('invalid_credentials');
  });

  it('SEC-3: twofa_enabled sin verificador → totp_unavailable (fail-closed)', async () => {
    const result = await authenticateCredentials(
      { email: baseUser.email, password: 'ValidPass1!' },
      {
        findUserByEmail: vi
          .fn()
          .mockResolvedValue({ ...baseUser, twofaEnabled: true }),
        verifyPassword: vi.fn().mockResolvedValue(true),
        isTotpVerifierAvailable: () => false,
      },
    );

    expect(result).toMatchObject({ ok: false, reason: 'totp_unavailable' });
  });

  it('SEC-1: inactivo e inexistente comparten reason invalid_credentials', async () => {
    const inactive = await authenticateCredentials(
      { email: baseUser.email, password: 'x' },
      {
        findUserByEmail: vi
          .fn()
          .mockResolvedValue({ ...baseUser, isActive: false }),
        verifyPassword: vi.fn().mockResolvedValue(false),
        isTotpVerifierAvailable: () => false,
      },
    );
    const missing = await authenticateCredentials(
      { email: 'n@x.co', password: 'x' },
      {
        findUserByEmail: vi.fn().mockResolvedValue(null),
        verifyPassword: vi.fn(),
        isTotpVerifierAvailable: () => false,
      },
    );

    expect(inactive).toMatchObject({ ok: false, reason: 'invalid_credentials' });
    expect(missing).toMatchObject({ ok: false, reason: 'invalid_credentials' });
  });
});
