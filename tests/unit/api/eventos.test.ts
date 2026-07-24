/**
 * GTK-32 — POST /api/eventos (handler + abuse cases SEC).
 */
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimitMock = vi.fn();
const recordConversionEventsMock = vi.fn();

vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
}));

vi.mock('@/lib/security/rate-limit-env', () => ({
  readRateLimitEnv: () => ({ loginPerMin: 5, publicPerMin: 20 }),
}));

vi.mock('@/lib/analytics/record-event', () => ({
  recordConversionEvents: (...args: unknown[]) =>
    recordConversionEventsMock(...args),
}));

import { POST } from '@/app/api/eventos/route';

function postBody(
  body: unknown,
  contentType = 'application/json',
) {
  const payload =
    typeof body === 'string' ? body : JSON.stringify(body);
  return POST(
    new NextRequest('http://localhost:3000/api/eventos', {
      method: 'POST',
      headers: {
        'content-type': contentType,
        'x-forwarded-for': '203.0.113.10',
      },
      body: payload,
    }),
  );
}

describe('POST /api/eventos (GTK-32)', () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    recordConversionEventsMock.mockReset();
    checkRateLimitMock.mockReturnValue({ allowed: true });
    recordConversionEventsMock.mockResolvedValue(1);
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('202 con recorded=1 para evento simple', async () => {
    const res = await postBody({ eventName: 'calculator_use' });
    expect(res.status).toBe(202);
    await expect(res.json()).resolves.toEqual({
      success: true,
      data: { recorded: 1 },
    });
  });

  it('202 con lote y recorded=N', async () => {
    recordConversionEventsMock.mockResolvedValue(2);
    const res = await postBody({
      events: [{ eventName: 'click_tel' }, { eventName: 'click_email' }],
    });
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.data.recorded).toBe(2);
  });

  it('SEC-1: 400 VALIDATION_ERROR con eventName inválido', async () => {
    const res = await postBody({ eventName: 'not_an_event' });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(recordConversionEventsMock).not.toHaveBeenCalled();
  });

  it('SEC-1: 400 con claves desconocidas', async () => {
    const res = await postBody({
      eventName: 'click_tel',
      email: 'pii@example.com',
    });
    expect(res.status).toBe(400);
    expect(recordConversionEventsMock).not.toHaveBeenCalled();
  });

  it('parseo beacon text/plain → 202', async () => {
    const res = await postBody(
      JSON.stringify({ eventName: 'scroll_depth' }),
      'text/plain',
    );
    expect(res.status).toBe(202);
  });

  it('SEC-2: 429 RATE_LIMITED con Retry-After', async () => {
    checkRateLimitMock.mockReturnValue({
      allowed: false,
      retryAfterMs: 45_000,
    });
    const res = await postBody({ eventName: 'click_whatsapp' });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('45');
    const json = await res.json();
    expect(json.error.code).toBe('RATE_LIMITED');
    expect(recordConversionEventsMock).not.toHaveBeenCalled();
  });

  it('SEC-2: lote consume N unidades de rate limit', async () => {
    recordConversionEventsMock.mockResolvedValue(3);
    await postBody({
      events: [
        { eventName: 'click_tel' },
        { eventName: 'click_whatsapp' },
        { eventName: 'click_email' },
      ],
    });
    // Una llamada con cost=3 o 3 llamadas unitarias
    const totalCost = checkRateLimitMock.mock.calls.reduce((sum, call) => {
      const cost = typeof call[3] === 'number' ? call[3] : 1;
      return sum + cost;
    }, 0);
    expect(totalCost).toBeGreaterThanOrEqual(3);
  });

  it('SEC-5: respuesta de éxito solo expone recorded', async () => {
    const res = await postBody({
      eventName: 'generate_lead',
      gaClientId: 'GA1.2.xxx',
      sessionId: 'sess-1',
    });
    const json = await res.json();
    expect(Object.keys(json.data)).toEqual(['recorded']);
  });
});
