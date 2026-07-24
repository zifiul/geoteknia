/**
 * TOTP core — GTK-24
 */
import { generateSync, verifySync } from 'otplib';
import { describe, expect, it } from 'vitest';

import {
  generateTotpSecret,
  verifyTotpCode,
} from '@/lib/auth/totp-core';

describe('lib/auth/totp-core (GTK-24)', () => {
  it('generateTotpSecret devuelve secreto y URI otpauth', () => {
    const { secret, otpauthUri } = generateTotpSecret('user@geoteknia.test');

    expect(secret.length).toBeGreaterThan(10);
    expect(otpauthUri).toMatch(/^otpauth:\/\/totp\//);
    expect(otpauthUri).toContain(encodeURIComponent('user@geoteknia.test'));
  });

  it('acepta código correcto dentro de la ventana ±1 periodo', async () => {
    const { secret } = generateTotpSecret('a@b.co');
    const token = generateSync({ secret });

    await expect(verifyTotpCode(secret, token)).resolves.toBe(true);
  });

  it('rechaza código fuera de ventana', async () => {
    const { secret } = generateTotpSecret('a@b.co');
    const stale = generateSync({
      secret,
      epoch: Math.floor(Date.now() / 1000) - 120,
    });

    await expect(verifyTotpCode(secret, stale)).resolves.toBe(false);
  });

  it('rechaza código incorrecto', async () => {
    const { secret } = generateTotpSecret('a@b.co');

    await expect(verifyTotpCode(secret, '000000')).resolves.toBe(false);
  });

  it('verifySync con epochTolerance 30 acepta periodo anterior', () => {
    const { secret } = generateTotpSecret('t@e.st');
    const now = Math.floor(Date.now() / 1000);
    const previousPeriod = generateSync({
      secret,
      epoch: now - 30,
    });

    const strict = verifySync({
      secret,
      token: previousPeriod,
      epochTolerance: 0,
    });
    const tolerant = verifySync({
      secret,
      token: previousPeriod,
      epochTolerance: 30,
    });

    expect(strict.valid).toBe(false);
    expect(tolerant.valid).toBe(true);
  });
});
