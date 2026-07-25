import 'server-only';

import type { PublicOrganizationProfile } from '@/lib/content/organization';
import type { PublishedServiceZonePageLink } from '@/lib/content/service-zone-pages';
import type { PublishedServiceDetail } from '@/lib/content/services';
import { env } from '@/lib/env';
import { buildServiceSchema } from '@/lib/seo/jsonld';
import { buildSiloUrl } from '@/lib/seo/silo-urls';

export function buildServicePageJsonLd(
  service: PublishedServiceDetail,
  profile: PublicOrganizationProfile | null,
  zonePages: PublishedServiceZonePageLink[],
): Record<string, unknown> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const url = buildSiloUrl(siteUrl, 'service', { slug: service.slug });
  const areaServed = zonePages.map((page) => page.zoneName);

  return buildServiceSchema({
    name: service.h1?.trim() || service.name,
    description: service.summary,
    url,
    imageUrl: service.heroImageUrl,
    serviceType: service.name,
    provider: profile
      ? {
          name: profile.displayName,
          url: siteUrl,
        }
      : undefined,
    areaServed: areaServed.length ? areaServed : profile?.areaServed ?? undefined,
  });
}
