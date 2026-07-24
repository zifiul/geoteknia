/**
 * Server Actions TOTP — GTK-24
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));
vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,qr') },
}));

const getPortalSession = vi.fn();
vi.mock('@/lib/auth/session', () => ({
  getPortalSession: (...args: unknown[]) => getPortalSession(...args),
  InvalidSessionError: class InvalidSessionError extends Error {
    constructor(message = 'Sesión no válida') {
      super(message);
      this.name = 'InvalidSessionError';
    }
  },
}));

const encryptSecret = vi.fn();
const decryptSecret = vi.fn();
vi.mock('@/lib/auth/crypto', () => ({
  encryptSecret: (...args: unknown[]) => encryptSecret(...args),
  decryptSecret: (...args: unknown[]) => decryptSecret(...args),
}));

const generateTotpSecret = vi.fn();
const verifyTotpCode = vi.fn();
vi.mock('@/lib/auth/totp-core', () => ({
  generateTotpSecret: (...args: unknown[]) => generateTotpSecret(...args),
  verifyTotpCode: (...args: unknown[]) => verifyTotpCode(...args),
}));

const verifyTotp = vi.fn();
vi.mock('@/lib/auth/totp', () => ({
  verifyTotp: (...args: unknown[]) => verifyTotp(...args),
}));

const verifyPassword = vi.fn();
vi.mock('@/lib/auth/passwords', () => ({
  verifyPassword: (...args: unknown[]) => verifyPassword(...args),
}));

const recordAudit = vi.fn();
vi.mock('@/lib/audit', () => ({
  recordAudit: (...args: unknown[]) => recordAudit(...args),
}));

const userFindFirst = vi.fn();
const userUpdate = vi.fn();
const transaction = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findFirst: (...args: unknown[]) => userFindFirst(...args),
      update: (...args: unknown[]) => userUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) =>
      transaction(fn),
  },
}));

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('lib/auth/totp-actions (GTK-24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPortalSession.mockResolvedValue({ userId: USER_ID });
    encryptSecret.mockReturnValue('encrypted');
    userUpdate.mockResolvedValue({});
    recordAudit.mockResolvedValue({ id: 'audit-1' });
    transaction.mockImplementation(async (fn) => {
      const tx = {
        user: { update: userUpdate },
      };
      await fn(tx);
    });
  });

  it('confirmTotpActivationAction activa 2FA con código válido', async () => {
    userFindFirst.mockResolvedValue({
      twofaSecret: 'cipher',
      twofaEnabled: false,
    });
    decryptSecret.mockReturnValue('PLAIN');
    verifyTotpCode.mockResolvedValue(true);

    const { confirmTotpActivationAction } = await import(
      '@/lib/auth/totp-actions'
    );

    const result = await confirmTotpActivationAction({ totp: '123456' });
    expect(result).toEqual({ ok: true });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'role_change',
        metadata: expect.objectContaining({ event: '2fa_enabled' }),
      }),
      expect.objectContaining({ tx: expect.anything() }),
    );
  });

  it('confirmTotpActivationAction rechaza código inválido', async () => {
    userFindFirst.mockResolvedValue({
      twofaSecret: 'cipher',
      twofaEnabled: false,
    });
    decryptSecret.mockReturnValue('PLAIN');
    verifyTotpCode.mockResolvedValue(false);

    const { confirmTotpActivationAction } = await import(
      '@/lib/auth/totp-actions'
    );

    const result = await confirmTotpActivationAction({ totp: '123456' });
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TOTP' } });
  });

  it('disableTotpAction exige reautenticación correcta', async () => {
    userFindFirst.mockResolvedValue({
      passwordHash: 'hash',
      twofaEnabled: true,
    });
    verifyPassword.mockResolvedValue(true);
    verifyTotp.mockResolvedValue(true);

    const { disableTotpAction } = await import('@/lib/auth/totp-actions');

    const result = await disableTotpAction({
      password: 'ValidPass1!',
      totp: '654321',
    });
    expect(result).toEqual({ ok: true });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ event: '2fa_disabled' }),
      }),
      expect.anything(),
    );
  });

  it('disableTotpAction rechaza contraseña incorrecta', async () => {
    userFindFirst.mockResolvedValue({
      passwordHash: 'hash',
      twofaEnabled: true,
    });
    verifyPassword.mockResolvedValue(false);

    const { disableTotpAction } = await import('@/lib/auth/totp-actions');

    const result = await disableTotpAction({
      password: 'WrongPass1!',
      totp: '654321',
    });
    expect(result).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } });
  });

  describe('abuse cases / SEC (GTK-24)', () => {
    it('SEC-6: sin sesión válida → UNAUTHORIZED en generate', async () => {
      const { InvalidSessionError } = await import('@/lib/auth/session');
      getPortalSession.mockRejectedValue(new InvalidSessionError());

      const { generateTotpSecretAction } = await import(
        '@/lib/auth/totp-actions'
      );

      const result = await generateTotpSecretAction();
      expect(result).toMatchObject({
        ok: false,
        error: { code: 'UNAUTHORIZED' },
      });
      expect(userUpdate).not.toHaveBeenCalled();
    });

    it('SEC-6: sin sesión válida → UNAUTHORIZED en confirm', async () => {
      const { InvalidSessionError } = await import('@/lib/auth/session');
      getPortalSession.mockRejectedValue(new InvalidSessionError());

      const { confirmTotpActivationAction } = await import(
        '@/lib/auth/totp-actions'
      );

      const result = await confirmTotpActivationAction({ totp: '123456' });
      expect(result).toMatchObject({
        ok: false,
        error: { code: 'UNAUTHORIZED' },
      });
    });

    it('SEC-3: confirm rechaza payload fuera de schema (VALIDATION_ERROR)', async () => {
      const { confirmTotpActivationAction } = await import(
        '@/lib/auth/totp-actions'
      );

      const result = await confirmTotpActivationAction({ totp: '12ab56' });
      expect(result).toMatchObject({
        ok: false,
        error: { code: 'VALIDATION_ERROR' },
      });
      expect(verifyTotpCode).not.toHaveBeenCalled();
    });

    it('SEC-4: disable rechaza TOTP inválido tras password correcta', async () => {
      userFindFirst.mockResolvedValue({
        passwordHash: 'hash',
        twofaEnabled: true,
      });
      verifyPassword.mockResolvedValue(true);
      verifyTotp.mockResolvedValue(false);

      const { disableTotpAction } = await import('@/lib/auth/totp-actions');

      const result = await disableTotpAction({
        password: 'ValidPass1!',
        totp: '000000',
      });
      expect(result).toMatchObject({
        ok: false,
        error: { code: 'INVALID_TOTP' },
      });
      expect(recordAudit).not.toHaveBeenCalled();
    });

    it('SEC-2: generate no expone campo secret en la respuesta', async () => {
      userFindFirst.mockResolvedValue({
        email: 'user@geoteknia.test',
        twofaEnabled: false,
      });
      generateTotpSecret.mockReturnValue({
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUri: 'otpauth://totp/Geoteknia:user%40test?secret=JBSWY3DPEHPK3PXP',
      });

      const { generateTotpSecretAction } = await import(
        '@/lib/auth/totp-actions'
      );

      const result = await generateTotpSecretAction();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result).not.toHaveProperty('secret');
        expect(encryptSecret).toHaveBeenCalledWith('JBSWY3DPEHPK3PXP');
      }
    });

    it('SEC-7: fallo de audit en mustAudit propaga y no devuelve ok', async () => {
      userFindFirst.mockResolvedValue({
        twofaSecret: 'cipher',
        twofaEnabled: false,
      });
      decryptSecret.mockReturnValue('PLAIN');
      verifyTotpCode.mockResolvedValue(true);
      recordAudit.mockRejectedValue(new Error('audit db down'));

      const { confirmTotpActivationAction } = await import(
        '@/lib/auth/totp-actions'
      );

      await expect(
        confirmTotpActivationAction({ totp: '123456' }),
      ).rejects.toThrow('audit db down');
    });
  });
});
