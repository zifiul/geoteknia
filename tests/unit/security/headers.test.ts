/**
 * GTK-26 — cabeceras de endurecimiento y noindex (delta admin-security-hardening).
 */
import { describe, expect, it } from 'vitest';

import {
  SECURITY_HEADERS,
  withNoIndexHeaders,
} from '@/lib/security/headers';

describe('lib/security/headers', () => {
  it('SECURITY_HEADERS incluye X-Content-Type-Options nosniff', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
  });

  it('SECURITY_HEADERS incluye Referrer-Policy documentada', () => {
    expect(SECURITY_HEADERS['Referrer-Policy']).toBeTruthy();
    expect(typeof SECURITY_HEADERS['Referrer-Policy']).toBe('string');
  });

  it('SEC-3: withNoIndexHeaders añade X-Robots-Tag noindex, nofollow', () => {
    const base = new Response(null, { status: 200 });
    const enriched = withNoIndexHeaders(base);

    expect(enriched.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('withNoIndexHeaders conserva cabeceras de seguridad del conjunto', () => {
    const base = new Response(null, { status: 200 });
    const enriched = withNoIndexHeaders(base);

    expect(enriched.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
