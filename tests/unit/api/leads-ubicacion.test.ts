/**
 * GTK-29 — POST /api/leads/ubicacion.
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const verifyTurnstileMock = vi.fn();
const createLocationLeadMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 2 }),
}));

vi.mock('@/lib/security/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileMock(...args),
}));

vi.mock('@/lib/leads/create-location-lead', () => ({
  createLocationLead: (...args: unknown[]) => createLocationLeadMock(...args),
}));

import { POST } from '@/app/api/leads/ubicacion/route';

const validBody = {
  cadastralRef: '1234567DF1234N0001WX',
  email: 'obra@example.com',
  gdprConsent: true,
  turnstileToken: 'valid-ts',
};

function postJson(body: unknown) {
  return POST(
    new NextRequest('http://localhost:3000/api/leads/ubicacion', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('POST /api/leads/ubicacion (GTK-29)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    verifyTurnstileMock.mockReset();
    createLocationLeadMock.mockReset();
    checkRateLimitMock.mockReturnValue({ allowed: true });
    verifyTurnstileMock.mockResolvedValue({ ok: true });
    createLocationLeadMock.mockResolvedValue({
      referenceNumber: 'UBI-20260724-ABCD',
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('201 con referenceNumber UBI-', async () => {
    const res = await postJson(validBody);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { referenceNumber: 'UBI-20260724-ABCD' },
    });
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'leads-ubicacion:unknown',
      2,
      60_000,
    );
  });

  it('400 sin ubicación', async () => {
    const res = await postJson({
      email: 'a@b.com',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(createLocationLeadMock).not.toHaveBeenCalled();
  });

  it('400 sin contacto', async () => {
    const res = await postJson({
      cadastralRef: 'REF',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(res.status).toBe(400);
    expect(createLocationLeadMock).not.toHaveBeenCalled();
  });

  it('403 TURNSTILE_INVALID', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'invalid' });
    const res = await postJson(validBody);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('TURNSTILE_INVALID');
  });

  it('429 RATE_LIMITED con Retry-After', async () => {
    checkRateLimitMock.mockReturnValue({ allowed: false, retryAfterMs: 30_000 });
    const res = await postJson(validBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('502 TURNSTILE_UNAVAILABLE', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'unavailable' });
    const res = await postJson(validBody);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error.code).toBe('TURNSTILE_UNAVAILABLE');
  });
});
