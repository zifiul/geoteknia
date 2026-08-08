import { config } from 'dotenv';

/** Cadena por defecto al contenedor Docker local (puerto 5433). */
export const DOCKER_DATABASE_URL =
  'postgresql://geoteknia:geoteknia_dev_only@localhost:5433/geoteknia_dev?sslmode=disable';

/**
 * Carga `.env` y aplica variables mínimas para tests QA/Vitest contra PostgreSQL.
 * Respeta valores ya definidos en el entorno (p. ej. CI o Neon).
 */
export function loadTestEnv(overrides?: Record<string, string>): void {
  config();

  const nodeEnv =
    overrides?.NODE_ENV ?? process.env.NODE_ENV ?? 'test';
  (process.env as NodeJS.ProcessEnv & {
    NODE_ENV: 'development' | 'test' | 'production';
  }).NODE_ENV = nodeEnv as 'development' | 'test' | 'production';

  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? DOCKER_DATABASE_URL;
  process.env.DIRECT_URL =
    process.env.DIRECT_URL ?? DOCKER_DATABASE_URL;
  process.env.NEXTAUTH_SECRET ??= 'local-qa-nextauth-secret-32chars-min';
  process.env.NEXTAUTH_URL ??= 'http://localhost:3000';
  process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';
  process.env.ANTHROPIC_API_KEY ??= 'sk-ant-local-qa-placeholder';
  process.env.TURNSTILE_SECRET_KEY ??=
    '1x0000000000000000000000000000000AA';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??=
    '1x00000000000000000000AA';
  process.env.SMTP_HOST ??= 'smtp.test.geoteknia.com';
  process.env.SMTP_PORT ??= '587';
  process.env.SMTP_SECURE ??= 'false';
  process.env.SMTP_USER ??= 'info@test.geoteknia.com';
  process.env.SMTP_PASSWORD ??= 'test-password-qa';
  process.env.EMAIL_FROM ??= 'Geoteknia <noreply@test.geoteknia.com>';
  process.env.EMAIL_REPLY_TO ??= 'presupuestos@test.geoteknia.com';
  process.env.SESSION_TTL_MINUTES ??= '480';
  process.env.TWOFA_ENCRYPTION_KEY ??=
    'ffaf4fe2ce037ac6ece4f59cf18e5f5977b8bacdc90aa50ad245465716afbc5f';
  process.env.MEDIA_STORAGE_BASE_URL ??= 'https://cdn.example.com/media';
  process.env.IA_USD_TO_EUR_RATE ??= '1';

  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      process.env[key] = value;
    }
  }
}

/** @deprecated Usar `loadTestEnv()`. */
export function applyVitestEnv(): void {
  loadTestEnv();
}
