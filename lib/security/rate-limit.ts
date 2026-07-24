export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const STORE_SYMBOL = '__geotekniaRateLimitStore';

function getStore(): Map<string, Bucket> {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_SYMBOL]?: Map<string, Bucket>;
  };
  if (!globalStore[STORE_SYMBOL]) {
    globalStore[STORE_SYMBOL] = new Map();
  }
  return globalStore[STORE_SYMBOL];
}

/**
 * Ventana fija por clave (MVP in-memory, por instancia/isolate).
 * Edge-compatible: sin APIs Node-only.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }

  existing.count += 1;
  return { allowed: true };
}
