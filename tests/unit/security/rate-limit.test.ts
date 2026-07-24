/**
 * GTK-26 — primitiva checkRateLimit (delta admin-security-hardening).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkRateLimit } from '@/lib/security/rate-limit';

describe('lib/security/rate-limit — checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-24T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite hasta N peticiones dentro de la ventana', () => {
    const key = 'test:allowed-window';
    const limit = 3;
    const windowMs = 60_000;

    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
  });

  it('SEC-4: bloquea la petición limit+1 en la misma ventana', () => {
    const key = 'test:blocked';
    const limit = 2;
    const windowMs = 60_000;

    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    const blocked = checkRateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('reinicia el contador tras expirar la ventana', () => {
    const key = 'test:expiry';
    const limit = 1;
    const windowMs = 1_000;

    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
  });

  it('aisla contadores por clave distinta', () => {
    const windowMs = 60_000;
    const limit = 1;

    expect(checkRateLimit('key-a', limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit('key-b', limit, windowMs).allowed).toBe(true);
    expect(checkRateLimit('key-a', limit, windowMs).allowed).toBe(false);
    expect(checkRateLimit('key-b', limit, windowMs).allowed).toBe(false);
  });
});
