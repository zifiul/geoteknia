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
  SMTP_HOST: 'smtp.test.geoteknia.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'info@test.geoteknia.com',
  SMTP_PASSWORD: 'fake-smtp-password',
  EMAIL_FROM: 'Geoteknia <noreply@test.geoteknia.com>',
  EMAIL_REPLY_TO: 'presupuestos@test.geoteknia.com',
  TURNSTILE_SECRET_KEY: 'turnstile-secret-fake',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site-fake',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  SESSION_TTL_MINUTES: '480',
  TWOFA_ENCRYPTION_KEY:
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  MEDIA_STORAGE_BASE_URL: 'https://cdn.test.geoteknia.com/media',
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

  it('acepta cadena Neon con sslmode=require', async () => {
    setEnv({
      ...REQUIRED_VARS,
      DATABASE_URL:
        'postgresql://user:pass@host.eu-central-1.aws.neon.tech/geoteknia?sslmode=require',
      DIRECT_URL:
        'postgresql://user:pass@host.eu-central-1.aws.neon.tech/geoteknia?sslmode=require',
    });

    const { env } = await import('@/lib/env');

    expect(env.DATABASE_URL).toContain('neon.tech');
    expect(env.DATABASE_URL).toContain('sslmode=require');
  });

  it('SMTP_SECURE="false" resuelve a boolean false (no coerción por truthy string)', async () => {
    setEnv({ ...REQUIRED_VARS, SMTP_SECURE: 'false' });

    const { env } = await import('@/lib/env');

    expect(env.SMTP_SECURE).toBe(false);
  });

  it('SMTP_SECURE="true" resuelve a boolean true', async () => {
    setEnv({ ...REQUIRED_VARS, SMTP_SECURE: 'true' });

    const { env } = await import('@/lib/env');

    expect(env.SMTP_SECURE).toBe(true);
  });

  it('acepta cadena Docker local con sslmode=disable', async () => {
    setEnv({
      ...REQUIRED_VARS,
      DATABASE_URL:
        'postgresql://geoteknia:geoteknia_dev_only@localhost:5433/geoteknia_dev?sslmode=disable',
      DIRECT_URL:
        'postgresql://geoteknia:geoteknia_dev_only@localhost:5433/geoteknia_dev?sslmode=disable',
    });

    const { env } = await import('@/lib/env');

    expect(env.DATABASE_URL).toContain('localhost:5433');
    expect(env.DATABASE_URL).toContain('sslmode=disable');
  });

  it('rechaza DATABASE_URL sin esquema PostgreSQL', async () => {
    setEnv({ ...REQUIRED_VARS, DATABASE_URL: 'mysql://localhost/db' });

    await expect(import('@/lib/env')).rejects.toThrow(/DATABASE_URL/);
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
    expect(error?.message).not.toContain(REQUIRED_VARS.SMTP_PASSWORD);
    expect(error?.message).not.toContain(REQUIRED_VARS.TURNSTILE_SECRET_KEY);
  });
});

describe('lib/env.ts — GTK-26 rate limit', () => {
  it('expone RATE_LIMIT_LOGIN_PER_MIN y RATE_LIMIT_PUBLIC_PER_MIN con defaults 5 y 20', async () => {
    setEnv(REQUIRED_VARS);

    const { env } = await import('@/lib/env');

    expect(env.RATE_LIMIT_LOGIN_PER_MIN).toBe(5);
    expect(env.RATE_LIMIT_PUBLIC_PER_MIN).toBe(20);
  });

  it('parsea umbrales personalizados cuando están definidos', async () => {
    setEnv({
      ...REQUIRED_VARS,
      RATE_LIMIT_LOGIN_PER_MIN: '10',
      RATE_LIMIT_PUBLIC_PER_MIN: '30',
    });

    const { env } = await import('@/lib/env');

    expect(env.RATE_LIMIT_LOGIN_PER_MIN).toBe(10);
    expect(env.RATE_LIMIT_PUBLIC_PER_MIN).toBe(30);
  });

  it('Upstash opcional: arranque sin UPSTASH_REDIS_REST_URL ni TOKEN', async () => {
    setEnv(REQUIRED_VARS);
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { env } = await import('@/lib/env');

    expect(env.UPSTASH_REDIS_REST_URL).toBeUndefined();
    expect(env.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
  });
});
