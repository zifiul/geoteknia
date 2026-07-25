/**
 * @vitest-environment jsdom
 * GTK-46 — mirror /api/eventos (SEC-2, SEC-4).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ACCEPT_ALL_CATEGORIES,
  saveConsent,
} from '@/lib/analytics/consent';
import { conversionEventSchema } from '@/lib/analytics/schema';
import { trackConversionEvent } from '@/lib/analytics/track';

describe('trackConversionEvent (GTK-46)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SEC-1: sin consentimiento no llama a fetch', async () => {
    const fetchMock = vi.fn();
    const result = await trackConversionEvent(
      { eventName: 'scroll_depth', value: 75 },
      { fetchImpl: fetchMock },
    );
    expect(result).toEqual({ dataLayer: false, mirrored: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('SEC-2/4: body cumple conversionEventSchema tras aceptar', async () => {
    saveConsent(window.localStorage, ACCEPT_ALL_CATEGORIES);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    await trackConversionEvent(
      {
        eventName: 'generate_lead',
        serviceSlug: 'estudio',
        leadType: 'presupuesto',
        formStep: 3,
        value: 1200,
        pageUrl: 'https://geoteknia.es/presupuesto?foo=bar',
      },
      { fetchImpl: fetchMock },
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as unknown;
    const parsed = conversionEventSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.pageUrl).toBe('https://geoteknia.es/presupuesto');
    expect(Object.keys(body as object).sort()).toEqual(
      expect.arrayContaining([
        'eventName',
        'formStep',
        'leadType',
        'pageUrl',
        'serviceSlug',
        'value',
      ]),
    );
  });
});
