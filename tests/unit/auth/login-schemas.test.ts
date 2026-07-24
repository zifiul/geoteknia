/**
 * Contrato Zod de login — GTK-23 / SEC-6.
 */
import { describe, expect, it } from 'vitest';
import {
  credentialsCallbackBodySchema,
  loginInputSchema,
} from '@/lib/auth/login-schemas';

describe('loginInputSchema (GTK-23 / SEC-6)', () => {
  it('acepta email normalizado y password válida', () => {
    const parsed = loginInputSchema.safeParse({
      email: '  Admin@Geoteknia.ES ',
      password: 'correcthorse',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe('admin@geoteknia.es');
    }
  });

  it('rechaza claves extra (strict)', () => {
    const parsed = loginInputSchema.safeParse({
      email: 'a@b.co',
      password: '12345678',
      evil: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rechaza password menor de 8 caracteres', () => {
    expect(
      loginInputSchema.safeParse({ email: 'a@b.co', password: 'short' }).success,
    ).toBe(false);
  });

  it('trata totp vacío como ausente (Auth.js)', () => {
    expect(
      loginInputSchema.safeParse({
        email: 'a@b.co',
        password: '12345678',
        totp: '',
      }).success,
    ).toBe(true);
  });

  it('rechaza totp con formato inválido', () => {
    expect(
      loginInputSchema.safeParse({
        email: 'a@b.co',
        password: '12345678',
        totp: '12ab56',
      }).success,
    ).toBe(false);
  });
});

describe('credentialsCallbackBodySchema', () => {
  it('exige csrfToken además de credenciales', () => {
    expect(
      credentialsCallbackBodySchema.safeParse({
        email: 'a@b.co',
        password: '12345678',
      }).success,
    ).toBe(false);

    expect(
      credentialsCallbackBodySchema.safeParse({
        email: 'a@b.co',
        password: '12345678',
        csrfToken: 'csrf-abc',
      }).success,
    ).toBe(true);
  });
});
