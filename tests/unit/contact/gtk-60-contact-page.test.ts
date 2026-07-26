import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://www.geoteknia.test' },
}));

import { buildContactLocalBusinessJsonLd } from '@/lib/contact/local-business-schema';
import { publicNapFromProfile } from '@/lib/contact/public-nap';
import { CONTACT_PAGE_BASE_PATH } from '@/lib/contact/page-config';
import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { buildUbicacionHref } from '@/lib/navigation/cta-query';

const sampleProfile: PublicOrganizationProfile = {
  displayName: 'Geoteknia',
  legalName: 'Geoteknius Engineering S.L.',
  napAddress: 'Calle Tecnología 12, 28045 Madrid',
  napPhone: '+34 912 345 678',
  napEmail: 'info@geoteknia.test',
  areaServed: ['Madrid'],
  aggregateRating: null,
};

describe('publicNapFromProfile (GTK-60)', () => {
  it('expone los mismos campos NAP que usa el footer con el mismo perfil', () => {
    const nap = publicNapFromProfile(sampleProfile);
    expect(nap).toEqual({
      displayName: sampleProfile.displayName,
      address: sampleProfile.napAddress,
      phone: sampleProfile.napPhone,
      email: sampleProfile.napEmail,
    });
  });

  it('usa fallback de displayName sin perfil', () => {
    expect(publicNapFromProfile(null).displayName).toBe('Geoteknia');
  });
});

describe('buildContactLocalBusinessJsonLd (GTK-60)', () => {
  it('apunta url a /contacto y no a la raíz', () => {
    const json = buildContactLocalBusinessJsonLd(sampleProfile, [
      {
        id: 'svc-1',
        slug: 'ensayos',
        name: 'Ensayos',
        summary: null,
        heroImageUrl: null,
        heroImageAlt: null,
        isPillar: false,
      },
    ]);
    expect(json.url).toBe(`https://www.geoteknia.test${CONTACT_PAGE_BASE_PATH}`);
    expect(json['@type']).toBe('ProfessionalService');
    expect(json.telephone).toBe(sampleProfile.napPhone);
  });
});

describe('buildUbicacionHref (GTK-60)', () => {
  it('propaga contexto de servicio en query', () => {
    expect(buildUbicacionHref('/servicios/ensayos/madrid')).toBe(
      '/ubicacion?servicio=ensayos&provincia=madrid',
    );
  });
});
