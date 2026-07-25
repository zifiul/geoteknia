import { pushRawDataLayer } from './datalayer';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type AttributionCapture = Partial<
  Record<(typeof UTM_KEYS)[number] | 'gclid', string>
>;

export function parseAttributionFromSearch(
  search: string,
): AttributionCapture | null {
  const params = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  );
  const capture: AttributionCapture = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) capture[key] = value.slice(0, 200);
  }
  const gclid = params.get('gclid');
  if (gclid) capture.gclid = gclid.slice(0, 200);
  return Object.keys(capture).length > 0 ? capture : null;
}

/**
 * Captura técnica utm/gclid en dataLayer (sin PII); no requiere consentimiento de analítica.
 */
export function captureAttributionToDataLayer(search: string): boolean {
  if (typeof window === 'undefined') return false;
  const attribution = parseAttributionFromSearch(search);
  if (!attribution) return false;
  pushRawDataLayer({
    event: 'attribution_capture',
    attribution,
  });
  return true;
}
