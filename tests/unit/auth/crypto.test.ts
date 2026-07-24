/**
 * Cifrado twofa_secret — GTK-24
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const TEST_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('lib/auth/crypto (GTK-24)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.TWOFA_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.TWOFA_ENCRYPTION_KEY;
  });

  async function loadCrypto() {
    const envKeys = [
      'DATABASE_URL',
      'DIRECT_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'ANTHROPIC_API_KEY',
      'RESEND_API_KEY',
      'EMAIL_FROM',
      'EMAIL_REPLY_TO',
      'TURNSTILE_SECRET_KEY',
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
      'NODE_ENV',
      'SESSION_TTL_MINUTES',
    ] as const;
    for (const key of envKeys) {
      if (key === 'NODE_ENV') {
        continue;
      }
      if (!process.env[key]) {
        if (key === 'SESSION_TTL_MINUTES') {
          process.env.SESSION_TTL_MINUTES = '480';
        } else {
          process.env[key] = 'placeholder-value-for-crypto-test';
        }
      }
    }
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.EMAIL_REPLY_TO = 'a@b.co';
    return import('@/lib/auth/crypto');
  }

  it('round-trip cifrado/descifrado', async () => {
    const { encryptSecret, decryptSecret } = await loadCrypto();
    const plain = 'JBSWY3DPEHPK3PXP';

    const cipher = encryptSecret(plain);
    expect(cipher).not.toContain(plain);
    expect(decryptSecret(cipher)).toBe(plain);
  });

  it('falla con ciphertext manipulado (GCM auth tag)', async () => {
    const { encryptSecret, decryptSecret } = await loadCrypto();
    const cipher = encryptSecret('secret-value');
    const buf = Buffer.from(cipher, 'base64');
    const last = buf.length - 1;
    buf[last] = (buf[last] ?? 0) ^ 0xff;

    expect(() => decryptSecret(buf.toString('base64'))).toThrow();
  });

  it('falla con clave incorrecta', async () => {
    const { encryptSecret } = await loadCrypto();
    const cipher = encryptSecret('secret-value');

    process.env.TWOFA_ENCRYPTION_KEY =
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    vi.resetModules();
    const { decryptSecret } = await loadCrypto();

    expect(() => decryptSecret(cipher)).toThrow();
  });
});
