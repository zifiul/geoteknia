/**
 * Tests de lib/env.ts — requisitos de la delta spec env-validation (GTK-21).
 * Cubre: parseo correcto, fail-fast con variable ausente y SEC-4 (el error
 * enumera nombres de variables, nunca valores).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 'server-only' lanza en runtime fuera de React Server Components; se mockea
// para poder testear el módulo en Node (SEC-1 se verifica vía build en fase 5b).
vi.mock('server-only', () => ({}));

const REQUIRED_VARS = {
  DATABASE_URL: 'postgresql://user:fake-password-123@localhost:5432/geoteknia',
  DIRECT_URL: 'postgresql://user:fake-password-123@localhost:5432/geoteknia',
  NEXTAUTH_SECRET: 'secreto-de-prueba-nextauth',
  NEXTAUTH_URL: 'http://localhost:3000',
  ANTHROPIC_API_KEY: 'sk-ant-fake-key',
  RESEND_API_KEY: 're_fake_key',
  EMAIL_FROM: 'Geoteknia <noreply@test.geoteknia.com>',
  EMAIL_REPLY_TO: 'presupuestos@test.geoteknia.com',
  TURNSTILE_SECRET_KEY: 'turnstile-secret-fake',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site-fake',
  NODE_ENV: 'test',
  SESSION_TTL_MINUTES: '480',
  TWOFA_ENCRYPTION_KEY:
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
} as const;

const originalEnv = { ...process.env };

function setEnv(vars: Record<string, string | undefined>): void {
  for (const key of Object.keys(REQUIRED_VARS)) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('lib/env.ts — validación de variables de entorno', () => {
  it('con el entorno completo exporta el objeto env tipado con los valores parseados', async () => {
    setEnv(REQUIRED_VARS);

    const { env } = await import('@/lib/env');

    expect(env.DATABASE_URL).toBe(REQUIRED_VARS.DATABASE_URL);
    expect(env.DIRECT_URL).toBe(REQUIRED_VARS.DIRECT_URL);
    expect(env.NEXTAUTH_URL).toBe(REQUIRED_VARS.NEXTAUTH_URL);
    expect(env.NODE_ENV).toBe('test');
  });

  it('lanza un error explícito que identifica la variable ausente', async () => {
    setEnv({ ...REQUIRED_VARS, DATABASE_URL: undefined });

    await expect(import('@/lib/env')).rejects.toThrow(/DATABASE_URL/);
  });

  it('enumera todas las variables ausentes cuando faltan varias', async () => {
    setEnv({
      ...REQUIRED_VARS,
      DATABASE_URL: undefined,
      ANTHROPIC_API_KEY: undefined,
    });

    const error = await import('@/lib/env').then(
      () => null,
      (e: unknown) => e as Error,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toMatch(/DATABASE_URL/);
    expect(error?.message).toMatch(/ANTHROPIC_API_KEY/);
  });

  it('SEC-4: el mensaje de error no contiene valores de otras variables', async () => {
    setEnv({ ...REQUIRED_VARS, DATABASE_URL: undefined });

    const error = await import('@/lib/env').then(
      () => null,
      (e: unknown) => e as Error,
    );

    expect(error).toBeInstanceOf(Error);
    // Debe ser el error de validación de env (no un error de import),
    // y no debe volcar valores de otras variables.
    expect(error?.message).toMatch(/DATABASE_URL/);
    expect(error?.message).not.toContain(REQUIRED_VARS.NEXTAUTH_SECRET);
    expect(error?.message).not.toContain(REQUIRED_VARS.ANTHROPIC_API_KEY);
    expect(error?.message).not.toContain(REQUIRED_VARS.RESEND_API_KEY);
    expect(error?.message).not.toContain(REQUIRED_VARS.TURNSTILE_SECRET_KEY);
  });
});
