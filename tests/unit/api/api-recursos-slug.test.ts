/**
 * GTK-30 — Route Handler POST /api/recursos/[slug] (descarga de lead magnet gated).
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const verifyTurnstileMock = vi.fn();
const findGatedLeadMagnetBySlugMock = vi.fn();
const createResourceLeadMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 2 }),
}));

vi.mock('@/lib/security/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileMock(...args),
}));

vi.mock('@/lib/content/lead-magnets', () => ({
  findGatedLeadMagnetBySlug: (...args: unknown[]) => findGatedLeadMagnetBySlugMock(...args),
}));

vi.mock('@/lib/leads/create-resource-lead', () => ({
  createResourceLead: (...args: unknown[]) => createResourceLeadMock(...args),
}));

import { POST } from '@/app/api/recursos/[slug]/route';

const sampleLeadMagnet = {
  id: 'lm-1',
  title: 'Guía de Geotecnia 2026',
  slug: 'guia-geotecnia-2026',
  thankYouUrl: '/recursos/guia-geotecnia-2026/gracias',
  fileId: 'media-1',
  serviceId: null,
};

const validBody = {
  nombre: 'Laura Martínez',
  email: 'laura@ingenieria.es',
  empresa: 'Constructora Beta',
  gdprConsent: true,
  turnstileToken: 'valid-ts',
};

function postJson(slug: string, body: unknown) {
  return POST(
    new NextRequest(`http://localhost:3000/api/recursos/${slug}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug }) },
  );
}

describe('POST /api/recursos/[slug] (GTK-30)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    verifyTurnstileMock.mockReset();
    findGatedLeadMagnetBySlugMock.mockReset();
    createResourceLeadMock.mockReset();

    checkRateLimitMock.mockReturnValue({ allowed: true });
    verifyTurnstileMock.mockResolvedValue({ ok: true });
    findGatedLeadMagnetBySlugMock.mockResolvedValue(sampleLeadMagnet);
    createResourceLeadMock.mockResolvedValue({
      referenceNumber: 'REC-20260725-XYZ1',
      downloadUrl: 'http://localhost:3000/api/recursos/download?token=abc',
      thankYouUrl: sampleLeadMagnet.thankYouUrl,
    });
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('201 Created con referenceNumber REC-, downloadUrl y thankYouUrl', async () => {
    const res = await postJson('guia-geotecnia-2026', validBody);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: {
        referenceNumber: 'REC-20260725-XYZ1',
        downloadUrl: 'http://localhost:3000/api/recursos/download?token=abc',
        thankYouUrl: '/recursos/guia-geotecnia-2026/gracias',
      },
    });

    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'recursos:unknown',
      2,
      60_000,
    );
  });

  it('404 RESOURCE_NOT_FOUND si el slug no existe o is_gated=false', async () => {
    findGatedLeadMagnetBySlugMock.mockResolvedValue(null);

    const res = await postJson('slug-inexistente', validBody);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error.code).toBe('RESOURCE_NOT_FOUND');
    expect(createResourceLeadMock).not.toHaveBeenCalled();
  });

  it('400 VALIDATION_ERROR si falta gdprConsent', async () => {
    const res = await postJson('guia-geotecnia-2026', {
      ...validBody,
      gdprConsent: false,
    });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(createResourceLeadMock).not.toHaveBeenCalled();
  });

  it('403 TURNSTILE_INVALID si el token Turnstile falla', async () => {
    verifyTurnstileMock.mockResolvedValue({ ok: false, reason: 'invalid' });

    const res = await postJson('guia-geotecnia-2026', validBody);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error.code).toBe('TURNSTILE_INVALID');
  });

  it('429 RATE_LIMITED con Retry-After si excede rate limit', async () => {
    checkRateLimitMock.mockReturnValue({ allowed: false, retryAfterMs: 45_000 });

    const res = await postJson('guia-geotecnia-2026', validBody);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('45');
  });

  it('400 VALIDATION_ERROR si incluye campos no permitidos (.strict())', async () => {
    const res = await postJson('guia-geotecnia-2026', {
      ...validBody,
      extraInjected: 'malicious',
    });
    expect(res.status).toBe(400);
    expect(createResourceLeadMock).not.toHaveBeenCalled();
  });
});
