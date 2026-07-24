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
 * @param cost unidades a consumir (p. ej. N eventos en un lote). Default 1.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  cost = 1,
): RateLimitResult {
  const safeCost = Number.isFinite(cost) && cost > 0 ? Math.floor(cost) : 1;
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    if (safeCost > limit) {
      store.set(key, { count: limit, resetAt: now + windowMs });
      return { allowed: false, retryAfterMs: windowMs };
    }
    store.set(key, { count: safeCost, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count + safeCost > limit) {
    return { allowed: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }

  existing.count += safeCost;
  return { allowed: true };
}
