/**
 * GTK-28 — Cloudflare Turnstile siteverify.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { TURNSTILE_SECRET_KEY: 'secret_test' },
}));

describe('verifyTurnstileToken (GTK-28)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('token válido → ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { verifyTurnstileToken } = await import('@/lib/security/turnstile');
    await expect(verifyTurnstileToken('tok')).resolves.toEqual({ ok: true });
  });

  it('success false → invalid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as Response);

    const { verifyTurnstileToken } = await import('@/lib/security/turnstile');
    await expect(verifyTurnstileToken('bad')).resolves.toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('fetch falla → unavailable', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    const { verifyTurnstileToken } = await import('@/lib/security/turnstile');
    await expect(verifyTurnstileToken('tok')).resolves.toEqual({
      ok: false,
      reason: 'unavailable',
    });
  });
});
