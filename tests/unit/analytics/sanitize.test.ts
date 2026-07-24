/**
 * GTK-32 — saneo de page_url (SEC-3).
 */
import { describe, expect, it } from 'vitest';

import { sanitizePageUrl } from '@/lib/analytics/sanitize';

describe('sanitizePageUrl (GTK-32)', () => {
  it('SEC-3: elimina querystring y fragment', () => {
    expect(
      sanitizePageUrl('https://geoteknia.es/servicios/estudio?email=a@b.com#top'),
    ).toBe('https://geoteknia.es/servicios/estudio');
  });

  it('conserva origin + pathname', () => {
    expect(sanitizePageUrl('https://geoteknia.es/calculadora/')).toBe(
      'https://geoteknia.es/calculadora/',
    );
  });

  it('devuelve null si la URL no es parseable', () => {
    expect(sanitizePageUrl('not-a-url')).toBeNull();
    expect(sanitizePageUrl('')).toBeNull();
  });
});
