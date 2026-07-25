import {
  CONSENT_MODE_DEFAULT_DENIED,
  CONSENT_STORAGE_KEY,
  consentCategoriesToMode,
  type ConsentCategories,
  type StoredConsent,
} from './consent-types';

export {
  CONSENT_MODE_DEFAULT_DENIED,
  CONSENT_STORAGE_KEY,
  consentCategoriesToMode,
  type ConsentCategories,
  type StoredConsent,
} from './consent-types';

export const REJECT_ALL_CATEGORIES: ConsentCategories = {
  essential: true,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL_CATEGORIES: ConsentCategories = {
  essential: true,
  analytics: true,
  marketing: true,
};

export type ConsentStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function parseStoredConsent(raw: string | null): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.version !== 1 || !parsed.categories) return null;
    if (parsed.categories.essential !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeConsent(categories: ConsentCategories): string {
  const stored: StoredConsent = {
    version: 1,
    categories,
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(stored);
}

export function loadConsent(storage: ConsentStorage): StoredConsent | null {
  return parseStoredConsent(storage.getItem(CONSENT_STORAGE_KEY));
}

export function saveConsent(
  storage: ConsentStorage,
  categories: ConsentCategories,
): StoredConsent {
  const stored = JSON.parse(serializeConsent(categories)) as StoredConsent;
  storage.setItem(CONSENT_STORAGE_KEY, serializeConsent(categories));
  return stored;
}

export function hasAnalyticsConsent(categories: ConsentCategories): boolean {
  return categories.analytics === true;
}

export function hasMarketingConsent(categories: ConsentCategories): boolean {
  return categories.marketing === true;
}

export function shouldLoadGtm(categories: ConsentCategories): boolean {
  return hasAnalyticsConsent(categories) || hasMarketingConsent(categories);
}

type GtagFn = (...args: unknown[]) => void;

export function applyConsentToGtag(
  categories: ConsentCategories,
  gtag: GtagFn,
): void {
  gtag('consent', 'update', consentCategoriesToMode(categories));
}

export function applyDefaultDeniedToGtag(gtag: GtagFn): void {
  gtag('consent', 'default', { ...CONSENT_MODE_DEFAULT_DENIED, wait_for_update: 500 });
}

export function getBrowserConsentStorage(): ConsentStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readBrowserConsent(): StoredConsent | null {
  const storage = getBrowserConsentStorage();
  if (!storage) return null;
  return loadConsent(storage);
}

export function writeBrowserConsent(categories: ConsentCategories): StoredConsent | null {
  const storage = getBrowserConsentStorage();
  if (!storage) return null;
  const stored = saveConsent(storage, categories);
  const gtag = (window as Window & { gtag?: GtagFn }).gtag;
  if (typeof gtag === 'function') {
    applyConsentToGtag(categories, gtag);
  }
  return stored;
}
