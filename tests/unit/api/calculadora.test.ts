/**
 * GTK-33 — POST /api/calculadora.
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const calculateAlcanceMock = vi.fn();
const recordConversionEventMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 20 }),
}));

vi.mock('@/lib/analytics/record-event', () => ({
  recordConversionEvent: (...args: unknown[]) =>
    recordConversionEventMock(...args),
}));

vi.mock('@/lib/calculator/calculate-alcance', () => ({
  calculateAlcance: (...args: unknown[]) => calculateAlcanceMock(...args),
}));

vi.mock('server-only', () => ({}));

import { POST } from '@/app/api/calculadora/route';

function postBody(body: unknown) {
  return POST(
    new NextRequest('http://localhost:3000/api/calculadora', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.44',
      },
      body: JSON.stringify(body),
    }),
  );
}

const prefill = {
  servicio: null,
  provincia: 'madrid',
  tipoObra: 'edificacion-residencial',
  plantas: 6,
  superficie: 3200,
};

describe('POST /api/calculadora (GTK-33)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    calculateAlcanceMock.mockReset();
    recordConversionEventMock.mockReset();
    checkRateLimitMock.mockReturnValue({ allowed: true });
    recordConversionEventMock.mockResolvedValue({ id: 'evt-1' });
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('200 con estimación y sin precio', async () => {
    calculateAlcanceMock.mockResolvedValue({
      kind: 'success',
      boreholes: 9,
      data: {
        boreholes: 9,
        depthEstimate: '15-25 m',
        recommendedTests: 'Sondeos',
        cteReference: 'CTE',
        prefill,
      },
    });
    const res = await postBody({
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
      provincia: 'madrid',
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.boreholes).toBe(9);
    expect(json.data.prefill).toEqual(prefill);
    expect(JSON.stringify(json)).not.toMatch(/precio|price|importe/i);
    expect(recordConversionEventMock).toHaveBeenCalledWith({
      eventName: 'calculator_use',
      provinceSlug: 'madrid',
      serviceSlug: 'edificacion-residencial',
      value: 9,
    });
  });

  it('SEC-6: fallo telemetría no impide 200', async () => {
    calculateAlcanceMock.mockResolvedValue({
      kind: 'success',
      boreholes: 5,
      data: {
        boreholes: 5,
        depthEstimate: null,
        recommendedTests: null,
        cteReference: null,
        prefill,
      },
    });
    recordConversionEventMock.mockRejectedValue(new Error('db down'));
    const res = await postBody({
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
      provincia: 'madrid',
    });
    expect(res.status).toBe(200);
  });

  it('SEC-1: 400 VALIDATION_ERROR con clave extra', async () => {
    const res = await postBody({
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
      provincia: 'madrid',
      hack: true,
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(calculateAlcanceMock).not.toHaveBeenCalled();
  });

  it('422 NO_APPLICABLE_RULE con prefill', async () => {
    calculateAlcanceMock.mockResolvedValue({
      kind: 'no_rule',
      message: 'Sin regla',
      prefill,
    });
    const res = await postBody({
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
      provincia: 'madrid',
    });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe('NO_APPLICABLE_RULE');
    expect(json.data.prefill).toEqual(prefill);
    expect(recordConversionEventMock).not.toHaveBeenCalled();
  });

  it('SEC-2: 429 RATE_LIMITED', async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: false,
      retryAfterMs: 30_000,
    });
    const res = await postBody({
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
      provincia: 'madrid',
    });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });
});
