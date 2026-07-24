/**
 * GTK-31 — POST /api/leads/licitacion.
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const verifyTurnstileMock = vi.fn();
const createTenderLeadMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 2 }),
}));

vi.mock('@/lib/security/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileMock(...args),
}));

vi.mock('@/lib/leads/create-tender-lead', () => ({
  createTenderLead: (...args: unknown[]) => createTenderLeadMock(...args),
}));

import { POST } from '@/app/api/leads/licitacion/route';

const validBody = {
  nombre: 'Ana López',
  empresa: 'Constructora SA',
  email: 'licitacion@example.com',
  expedienteRef: 'EXP-2026-001',
  gdprConsent: true,
  turnstileToken: 'valid-ts',
};

function postJson(body: unknown) {
  return POST(
    new NextRequest('http://localhost:3000/api/leads/licitacion', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('POST /api/leads/licitacion (GTK-31)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    verifyTurnstileMock.mockReset();
    createTenderLeadMock.mockReset();
    checkRateLimitMock.mockReturnValue({ allowed: true });
    verifyTurnstileMock.mockResolvedValue({ ok: true });
    createTenderLeadMock.mockResolvedValue({
      referenceNumber: 'LIC-20260724-ABCD',
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('201 con referenceNumber LIC-', async () => {
    const res = await postJson(validBody);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: { referenceNumber: 'LIC-20260724-ABCD' },
    });
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'leads-licitacion:unknown',
      2,
      60_000,
    );
  });

  it('400 sin expediente ni plataforma', async () => {
    const res = await postJson({
      nombre: 'Ana López',
      empresa: 'Constructora SA',
      email: 'licitacion@example.com',
      gdprConsent: true,
      turnstileToken: 'ts',
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(createTenderLeadMock).not.toHaveBeenCalled();
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

  it('SEC-31: 400 con clave extra (strict)', async () => {
    const res = await postJson({ ...validBody, injected: 'x' });
    expect(res.status).toBe(400);
    expect(createTenderLeadMock).not.toHaveBeenCalled();
  });
});
