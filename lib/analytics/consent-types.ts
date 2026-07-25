/** Preferencias de consentimiento RGPD (GTK-46). */
export type ConsentCategories = {
  /** Siempre activas; no se persisten como opt-in. */
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  version: 1;
  categories: ConsentCategories;
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = 'geoteknia_consent_v1';

export const CONSENT_MODE_DEFAULT_DENIED = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

export function consentCategoriesToMode(categories: ConsentCategories): {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
} {
  const marketing = categories.marketing ? 'granted' : 'denied';
  const analytics = categories.analytics ? 'granted' : 'denied';
  return {
    ad_storage: marketing,
    analytics_storage: analytics,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}
