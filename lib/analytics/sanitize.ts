/**
 * Sanea page_url de telemetría: solo origin + pathname (SEC-3 / anti-PII en query).
 */
export function sanitizePageUrl(raw: string): string | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
