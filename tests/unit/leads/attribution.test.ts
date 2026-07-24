/**
 * GTK-28 — atribución UTM → LeadSource.
 */
import { describe, expect, it } from 'vitest';

import { deriveLeadSource } from '@/lib/leads/attribution';

describe('deriveLeadSource (GTK-28)', () => {
  it('utm_medium cpc → sem', () => {
    expect(
      deriveLeadSource({ utmMedium: 'cpc', utmSource: 'google' }),
    ).toBe('sem');
  });

  it('utm_medium ppc → sem', () => {
    expect(deriveLeadSource({ utmMedium: 'ppc' })).toBe('sem');
  });

  it('utm_source google sin cpc → organico', () => {
    expect(deriveLeadSource({ utmSource: 'google' })).toBe('organico');
  });

  it('landing_url host externo → referral', () => {
    expect(
      deriveLeadSource({ landingUrl: 'https://partner.example.com/landing' }),
    ).toBe('referral');
  });

  it('sin datos → directo', () => {
    expect(deriveLeadSource({})).toBe('directo');
  });
});
