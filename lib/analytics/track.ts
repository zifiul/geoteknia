import { conversionEventSchema } from './schema';
import type { ConversionEventInput } from './schema';
import { sanitizePageUrl } from './sanitize';
import { hasAnalyticsConsent, readBrowserConsent } from './consent';
import { pushDataLayer } from './datalayer';

const EVENTOS_ENDPOINT = '/api/eventos';

function toMirrorPayload(input: ConversionEventInput): ConversionEventInput {
  const base =
    input.pageUrl !== undefined
      ? (() => {
          const sanitized = sanitizePageUrl(input.pageUrl!);
          if (sanitized === null) {
            const { pageUrl, ...rest } = input;
            void pageUrl;
            return rest;
          }
          return { ...input, pageUrl: sanitized };
        })()
      : input;
  const parsed = conversionEventSchema.safeParse(base);
  if (!parsed.success) {
    return base;
  }
  return parsed.data;
}

export type TrackConversionOptions = {
  fetchImpl?: typeof fetch;
};

/**
 * DataLayer + mirror a POST /api/eventos cuando hay consentimiento de analítica.
 */
export async function trackConversionEvent(
  input: ConversionEventInput,
  options?: TrackConversionOptions,
): Promise<{ dataLayer: boolean; mirrored: boolean }> {
  const stored = readBrowserConsent();
  const allowed =
    stored !== null && hasAnalyticsConsent(stored.categories);

  if (!allowed) {
    return { dataLayer: false, mirrored: false };
  }

  const pushed = pushDataLayer(input);
  const payload = toMirrorPayload(input);
  const valid = conversionEventSchema.safeParse(payload);
  if (!valid.success) {
    return { dataLayer: pushed, mirrored: false };
  }

  const fetchFn = options?.fetchImpl ?? fetch;
  try {
    const response = await fetchFn(EVENTOS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valid.data),
      keepalive: true,
      credentials: 'same-origin',
    });
    return { dataLayer: pushed, mirrored: response.ok };
  } catch {
    return { dataLayer: pushed, mirrored: false };
  }
}
