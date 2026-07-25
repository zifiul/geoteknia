import { hasAnalyticsConsent, readBrowserConsent } from './consent';
import type { ConversionEventInput } from './schema';
import { sanitizePageUrl } from './sanitize';

export type DataLayerPush = ConversionEventInput & { event?: string };

declare global {
  interface Window {
    dataLayer?: DataLayerPush[];
  }
}

export function ensureDataLayer(): DataLayerPush[] {
  if (typeof window === 'undefined') {
    return [];
  }
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

function withSanitizedPageUrl(
  input: ConversionEventInput,
): ConversionEventInput {
  if (input.pageUrl === undefined) {
    return input;
  }
  const sanitized = sanitizePageUrl(input.pageUrl);
  if (sanitized === null) {
    const { pageUrl, ...rest } = input;
    void pageUrl;
    return rest;
  }
  return { ...input, pageUrl: sanitized };
}

/**
 * Empuja un evento de conversión al dataLayer solo con consentimiento de analítica.
 */
export function pushDataLayer(input: ConversionEventInput): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const stored = readBrowserConsent();
  if (!stored || !hasAnalyticsConsent(stored.categories)) {
    return false;
  }
  const payload = withSanitizedPageUrl(input);
  const layer = ensureDataLayer();
  layer.push({
    ...payload,
    event: payload.eventName,
  });
  return true;
}

export function pushRawDataLayer(entry: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const layer = ensureDataLayer();
  layer.push(entry as DataLayerPush);
}
