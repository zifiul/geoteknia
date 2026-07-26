import 'server-only';

import type { PublicOrganizationProfile } from '@/lib/content/organization';
import type { PublishedServiceListItem } from '@/lib/content/services';
import { env } from '@/lib/env';
import { CONTACT_PAGE_BASE_PATH } from '@/lib/contact/page-config';
import { buildLocalBusinessSchema } from '@/lib/seo/jsonld';
import { buildSiloUrl } from '@/lib/seo/silo-urls';

export function buildContactLocalBusinessJsonLd(
  profile: PublicOrganizationProfile,
  services: PublishedServiceListItem[],
): Record<string, unknown> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const pageUrl = `${siteUrl}${CONTACT_PAGE_BASE_PATH}`;
  const catalogItems = services.map((service) => ({
    name: service.name,
    url: buildSiloUrl(siteUrl, 'service', { slug: service.slug }),
  }));

  return buildLocalBusinessSchema({
    name: profile.displayName,
    description: `Contacto — ingeniería geotécnica — ${profile.legalName}`,
    url: pageUrl,
    useProfessionalService: true,
    telephone: profile.napPhone,
    email: profile.napEmail,
    address: profile.napAddress,
    areaServed: profile.areaServed,
    offerCatalog: catalogItems.length
      ? { name: 'Servicios geotécnicos', items: catalogItems }
      : undefined,
  });
}
