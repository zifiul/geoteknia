import 'server-only';
import { z } from 'zod';

// SEC-1: módulo server-only; importar desde un Client Component rompe el build.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  EMAIL_REPLY_TO: z.email(),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive(),
  /** 32 bytes en hexadecimal (64 caracteres) para AES-256-GCM de twofa_secret. */
  TWOFA_ENCRYPTION_KEY: z.string().length(64).regex(/^[0-9a-fA-F]+$/),
  RATE_LIMIT_LOGIN_PER_MIN: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_PUBLIC_PER_MIN: z.coerce.number().int().positive().default(20),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  /** Base pública para URLs de media_assets (GTK-41). */
  MEDIA_STORAGE_BASE_URL: z.url(),
  /** Presupuesto mensual IA por defecto para seed (GTK-37, opcional). */
  IA_DEFAULT_MONTHLY_BUDGET_EUR: z.coerce.number().positive().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // SEC-4: solo se enumeran NOMBRES de variables, nunca valores.
  const invalidVars = [
    ...new Set(parsed.error.issues.map((issue) => issue.path.join('.'))),
  ];
  throw new Error(
    `Variables de entorno ausentes o inválidas: ${invalidVars.join(', ')}. ` +
      'Revisa .env.example para la lista completa de variables requeridas.',
  );
}

export const env = parsed.data;
