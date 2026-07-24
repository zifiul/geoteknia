/**
 * Contrato Zod TOTP — GTK-24 / fase 2
 */
import { describe, expect, it } from 'vitest';

import {
  confirmTotpActivationInputSchema,
  disableTotpInputSchema,
  generateTotpSecretActionResultSchema,
  totpVoidActionResultSchema,
} from '@/lib/auth/totp-schemas';

describe('lib/auth/totp-schemas (contrato GTK-24)', () => {
  it('confirmTotpActivationInputSchema acepta 6 dígitos y rechaza claves extra', () => {
    expect(
      confirmTotpActivationInputSchema.safeParse({ totp: '123456' }).success,
    ).toBe(true);
    expect(
      confirmTotpActivationInputSchema.safeParse({ totp: '12345' }).success,
    ).toBe(false);
    expect(
      confirmTotpActivationInputSchema.safeParse({
        totp: '123456',
        extra: true,
      }).success,
    ).toBe(false);
  });

  it('disableTotpInputSchema exige password y totp', () => {
    expect(
      disableTotpInputSchema.safeParse({
        password: 'ValidPass1!',
        totp: '654321',
      }).success,
    ).toBe(true);
    expect(
      disableTotpInputSchema.safeParse({ password: 'short', totp: '654321' })
        .success,
    ).toBe(false);
  });

  it('generateTotpSecretActionResultSchema valida éxito sin secreto Base32', () => {
    const ok = generateTotpSecretActionResultSchema.safeParse({
      ok: true,
      otpauthUri: 'otpauth://totp/Geoteknia:user@test.co?secret=ABC',
      qrDataUrl: 'data:image/png;base64,abc',
    });
    expect(ok.success).toBe(true);
    expect(
      generateTotpSecretActionResultSchema.safeParse({
        ok: true,
        otpauthUri: 'otpauth://totp/x',
        qrDataUrl: 'data:image/png;base64,x',
        secret: 'LEAK',
      }).success,
    ).toBe(false);
  });

  it('totpVoidActionResultSchema discrimina ok/error', () => {
    expect(totpVoidActionResultSchema.safeParse({ ok: true }).success).toBe(
      true,
    );
    expect(
      totpVoidActionResultSchema.safeParse({
        ok: false,
        error: { code: 'INVALID_TOTP', message: 'x' },
      }).success,
    ).toBe(true);
  });
});
