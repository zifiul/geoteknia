/**
 * GTK-46 — consent storage y Consent Mode (SEC).
 */
import { describe, expect, it, vi } from 'vitest';

import {
  ACCEPT_ALL_CATEGORIES,
  applyConsentToGtag,
  applyDefaultDeniedToGtag,
  consentCategoriesToMode,
  loadConsent,
  parseStoredConsent,
  REJECT_ALL_CATEGORIES,
  saveConsent,
  hasAnalyticsConsent,
  shouldLoadGtm,
} from '@/lib/analytics/consent';

function memoryStorage(): {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
} {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}

describe('consent (GTK-46)', () => {
  it('denied → granted: modo Consent v2 refleja categorías', () => {
    expect(consentCategoriesToMode(REJECT_ALL_CATEGORIES)).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(consentCategoriesToMode(ACCEPT_ALL_CATEGORIES)).toEqual({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('persistencia round-trip en storage', () => {
    const storage = memoryStorage();
    saveConsent(storage, ACCEPT_ALL_CATEGORIES);
    const loaded = loadConsent(storage);
    expect(loaded?.categories.analytics).toBe(true);
    expect(hasAnalyticsConsent(loaded!.categories)).toBe(true);
  });

  it('shouldLoadGtm solo tras opt-in analítica o marketing', () => {
    expect(shouldLoadGtm(REJECT_ALL_CATEGORIES)).toBe(false);
    expect(shouldLoadGtm({ essential: true, analytics: true, marketing: false })).toBe(
      true,
    );
  });

  it('gtag recibe default denied y update', () => {
    const gtag = vi.fn();
    applyDefaultDeniedToGtag(gtag);
    applyConsentToGtag(ACCEPT_ALL_CATEGORIES, gtag);
    expect(gtag).toHaveBeenCalledWith('consent', 'default', expect.objectContaining({
      analytics_storage: 'denied',
    }));
    expect(gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({
      analytics_storage: 'granted',
    }));
  });

  it('parseStoredConsent rechaza JSON inválido', () => {
    expect(parseStoredConsent(null)).toBeNull();
    expect(parseStoredConsent('{')).toBeNull();
    expect(parseStoredConsent(JSON.stringify({ version: 2 }))).toBeNull();
  });
});
