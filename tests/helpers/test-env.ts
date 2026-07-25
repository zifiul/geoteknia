/** Variables mínimas para cargar `@/lib/env` en Vitest. */
export function applyVitestEnv(): void {
  (process.env as NodeJS.ProcessEnv & { NODE_ENV: string }).NODE_ENV = 'test';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ??
    'postgresql://user:pass@localhost:5432/geoteknia?sslmode=require';
  process.env.DIRECT_URL =
    process.env.DIRECT_URL ??
    'postgresql://user:pass@localhost:5432/geoteknia?sslmode=require';
  process.env.NEXTAUTH_SECRET ??= 'local-qa-nextauth-secret-32chars-min';
  process.env.NEXTAUTH_URL ??= 'http://localhost:3000';
  process.env.ANTHROPIC_API_KEY ??= 'sk-ant-local-qa-placeholder';
  process.env.TURNSTILE_SECRET_KEY ??=
    '1x0000000000000000000000000000000AA';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??=
    '1x00000000000000000000AA';
  process.env.RESEND_API_KEY ??= 're_test_qa';
  process.env.EMAIL_FROM ??= 'Geoteknia <noreply@test.geoteknia.com>';
  process.env.EMAIL_REPLY_TO ??= 'presupuestos@test.geoteknia.com';
  process.env.SESSION_TTL_MINUTES ??= '480';
  process.env.TWOFA_ENCRYPTION_KEY ??=
    'ffaf4fe2ce037ac6ece4f59cf18e5f5977b8bacdc90aa50ad245465716afbc5f';
  process.env.MEDIA_STORAGE_BASE_URL ??= 'https://cdn.example.com/media';
  process.env.IA_USD_TO_EUR_RATE ??= '1';
}
