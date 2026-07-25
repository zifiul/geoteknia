export const CONSENT_UPDATED_EVENT = 'geoteknia:consent-updated';

export function dispatchConsentUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
}
