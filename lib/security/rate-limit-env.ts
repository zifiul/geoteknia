const DEFAULT_LOGIN_PER_MIN = 5;
const DEFAULT_PUBLIC_PER_MIN = 20;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/** Lectura Edge-safe de umbrales (no importar `lib/env.ts`). */
export function readRateLimitEnv(): {
  loginPerMin: number;
  publicPerMin: number;
} {
  return {
    loginPerMin: parsePositiveInt(
      process.env.RATE_LIMIT_LOGIN_PER_MIN,
      DEFAULT_LOGIN_PER_MIN,
    ),
    publicPerMin: parsePositiveInt(
      process.env.RATE_LIMIT_PUBLIC_PER_MIN,
      DEFAULT_PUBLIC_PER_MIN,
    ),
  };
}
