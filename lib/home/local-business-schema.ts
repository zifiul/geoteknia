import 'server-only';

import type { PublicOrganizationProfile } from '@/lib/content/organization';
import type { PublishedServiceListItem } from '@/lib/content/services';
import { env } from '@/lib/env';
import { buildLocalBusinessSchema } from '@/lib/seo/jsonld';
import { buildSiloUrl } from '@/lib/seo/silo-urls';

export function buildHomeLocalBusinessJsonLd(
  profile: PublicOrganizationProfile,
  services: PublishedServiceListItem[],
): Record<string, unknown> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const catalogItems = services.map((service) => ({
    name: service.name,
    url: buildSiloUrl(siteUrl, 'service', { slug: service.slug }),
  }));

  return buildLocalBusinessSchema({
    name: profile.displayName,
    description: `Ingeniería geotécnica — ${profile.legalName}`,
    url: siteUrl,
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
