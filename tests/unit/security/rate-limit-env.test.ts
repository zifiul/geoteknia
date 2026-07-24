/**
 * GTK-26 — lectura Edge-safe de umbrales (sin server-only).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readRateLimitEnv } from '@/lib/security/rate-limit-env';

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('lib/security/rate-limit-env', () => {
  it('devuelve defaults cuando las variables no están definidas', () => {
    delete process.env.RATE_LIMIT_LOGIN_PER_MIN;
    delete process.env.RATE_LIMIT_PUBLIC_PER_MIN;

    const config = readRateLimitEnv();

    expect(config.loginPerMin).toBe(5);
    expect(config.publicPerMin).toBe(20);
  });

  it('parsea enteros positivos del entorno', () => {
    process.env.RATE_LIMIT_LOGIN_PER_MIN = '7';
    process.env.RATE_LIMIT_PUBLIC_PER_MIN = '25';

    const config = readRateLimitEnv();

    expect(config.loginPerMin).toBe(7);
    expect(config.publicPerMin).toBe(25);
  });
});
