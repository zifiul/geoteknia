import 'server-only';
import { z } from 'zod';

// SEC-1: módulo server-only; importar desde un Client Component rompe el build.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']),
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
