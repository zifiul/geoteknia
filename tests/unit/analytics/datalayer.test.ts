/**
 * @vitest-environment jsdom
 * GTK-46 — dataLayer y consentimiento (SEC-1, SEC-3).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ACCEPT_ALL_CATEGORIES,
  saveConsent,
} from '@/lib/analytics/consent';
import { pushDataLayer, ensureDataLayer } from '@/lib/analytics/datalayer';

describe('datalayer (GTK-46)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dataLayer = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SEC-1: no empuja sin consentimiento de analítica', () => {
    const pushed = pushDataLayer({
      eventName: 'click_tel',
      serviceSlug: 'estudio',
    });
    expect(pushed).toBe(false);
    expect(ensureDataLayer()).toHaveLength(0);
  });

  it('empuja payload alineado con schema tras aceptar analítica', () => {
    saveConsent(window.localStorage, ACCEPT_ALL_CATEGORIES);
    const ok = pushDataLayer({
      eventName: 'click_tel',
      serviceSlug: 'estudio',
      provinceSlug: 'madrid',
      pageUrl: 'https://geoteknia.es/servicios/x?email=secret@test.com',
    });
    expect(ok).toBe(true);
    const layer = ensureDataLayer();
    expect(layer).toHaveLength(1);
    const entry = layer[0]!;
    expect(entry).toMatchObject({
      event: 'click_tel',
      eventName: 'click_tel',
      serviceSlug: 'estudio',
      pageUrl: 'https://geoteknia.es/servicios/x',
    });
    expect(entry.pageUrl).not.toContain('email=');
  });
});
