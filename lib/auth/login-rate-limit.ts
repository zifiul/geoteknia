import {
  LOGIN_RATE_LIMITED_MESSAGE,
  type LoginActionResult,
} from '@/lib/auth/login-schemas';
import { readRateLimitEnv } from '@/lib/security/rate-limit-env';
import { checkRateLimit } from '@/lib/security/rate-limit';

/**
 * Devuelve error de rate limit o null si el intento puede continuar.
 */
export function loginRateLimitResult(ip: string): LoginActionResult | null {
  const { loginPerMin } = readRateLimitEnv();
  const rate = checkRateLimit(`login:${ip}`, loginPerMin, 60_000);
  if (!rate.allowed) {
    return {
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: LOGIN_RATE_LIMITED_MESSAGE,
      },
    };
  }
  return null;
}
