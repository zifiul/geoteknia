/**
 * GTK-28 — POST /api/leads/presupuesto.
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const verifyTurnstileMock = vi.fn();
const createBudgetLeadMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 2 }),
}));

vi.mock('@/lib/security/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileMock(...args),
}));

vi.mock('@/lib/leads/create-lead', () => ({
  createBudgetLead: (...args: unknown[]) => createBudgetLeadMock(...args),
}));

import { POST } from '@/app/api/leads/presupuesto/route';

const validBody = {
  servicio: 'edificacion-residencial',
  provincia: 'madrid',
  nombre: 'Ana López',
  email: 'ana@empresa.com',
  telefono: '612345678',
  rol: 'promotor',
  gdprConsent: true,
  turnstileToken: 'valid-ts',
};

function postJson(body: unknown) {
  return POST(
    new NextRequest('http://localhost:3000/api/leads/presupuesto', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('POST /api/leads/presupuesto (GTK-28)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    verifyTurnstileMock.mockReset();
    createBudgetLeadMock.mockReset();
    checkRateLimitMock.mockReturnValue({ allowed: true });
    verifyTurnstileMock.mockResolvedValue({ ok: true });
    createBudgetLeadMock.mockResolvedValue({ referenceNumber: 'PRE-20260724-ABCD' });
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('201 con referenceNumber', async () => {
    const res = await postJson(validBody);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { referenceNumber: 'PRE-20260724-ABCD' },
    });
  });

  it('400 VALIDATION_ERROR sin gdprConsent true', async () => {
    const res = await postJson({ ...validBody, gdprConsent: false });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
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
    const json = await res.json();
    expect(json.error.code).toBe('RATE_LIMITED');
  });

  it('502 TURNSTILE_UNAVAILABLE', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'unavailable' });
    const res = await postJson(validBody);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error.code).toBe('TURNSTILE_UNAVAILABLE');
  });
});
