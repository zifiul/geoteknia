/**
 * GTK-46 — atribución UTM sin PII.
 */
import { describe, expect, it } from 'vitest';

import { parseAttributionFromSearch } from '@/lib/analytics/attribution';

describe('attribution (GTK-46)', () => {
  it('captura utm y gclid', () => {
    expect(
      parseAttributionFromSearch(
        '?utm_source=google&utm_campaign=test&gclid=abc123',
      ),
    ).toEqual({
      utm_source: 'google',
      utm_campaign: 'test',
      gclid: 'abc123',
    });
  });

  it('devuelve null sin params', () => {
    expect(parseAttributionFromSearch('')).toBeNull();
  });
});
