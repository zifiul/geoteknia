/**
 * GTK-69 — loginRateLimitResult.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 20 }),
}));

import { loginRateLimitResult } from '@/lib/auth/login-rate-limit';
import { LOGIN_RATE_LIMITED_MESSAGE } from '@/lib/auth/login-schemas';

describe('loginRateLimitResult (GTK-69)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
  });

  it('devuelve RATE_LIMITED cuando checkRateLimit bloquea', () => {
    checkRateLimitMock.mockReturnValue({
      allowed: false,
      retryAfterMs: 30_000,
    });

    const result = loginRateLimitResult('203.0.113.10');

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: LOGIN_RATE_LIMITED_MESSAGE,
      },
    });
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'login:203.0.113.10',
      5,
      60_000,
    );
  });

  it('devuelve null cuando el intento está permitido', () => {
    checkRateLimitMock.mockReturnValue({ allowed: true });
    expect(loginRateLimitResult('203.0.113.10')).toBeNull();
  });
});
