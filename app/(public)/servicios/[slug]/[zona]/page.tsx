import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { IntersectionScrollDepthTracker } from '@/components/analytics/IntersectionScrollDepthTracker';
import { IntersectionTemplate } from '@/components/organisms/intersection/IntersectionTemplate';
import { JsonLd } from '@/components/seo/json-ld';
import { getOrganizationProfile } from '@/lib/content/organization';
import {
  getPublishedServiceZonePageBySlugs,
  listPublishedServiceZonePageStaticParams,
} from '@/lib/content/service-zone-pages';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
} from '@/lib/seo/breadcrumbs';
import { buildServiceSchema } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { buildSiloUrl } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string; zona: string }>;
};

export async function generateStaticParams() {
  return listPublishedServiceZonePageStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, zona } = await params;
  const page = await getPublishedServiceZonePageBySlugs(slug, zona);
  if (!page) {
    return { title: 'Página no encontrada' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = {
    slug: page.slug,
    schemaType: page.schemaType,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    canonicalUrl: page.canonicalUrl,
    noindex: page.noindex,
  };
  return buildMetadata(siteUrl, 'service_zone_page', seoBlock, {
    siloExtra: { serviceSlug: page.service.slug, zoneSlug: page.zone.slug },
    ogImageUrl: page.service.heroImageUrl,
  });
}

export default async function ServiceZoneIntersectionPage({ params }: PageProps) {
  const { slug, zona } = await params;
  const page = await getPublishedServiceZonePageBySlugs(slug, zona);
  if (!page) {
    notFound();
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const displayTitle =
    page.h1?.trim() || `${page.service.name} en ${page.zone.name}`;
  const profile = await getOrganizationProfile();

  const intersectionUrl = buildSiloUrl(siteUrl, 'service_zone_page', {
    slug: page.slug,
    serviceSlug: page.service.slug,
    zoneSlug: page.zone.slug,
  });

  const serviceSchema = buildServiceSchema({
    name: displayTitle,
    description: page.metaDescription ?? page.service.summary,
    url: intersectionUrl,
    imageUrl: page.service.heroImageUrl,
    serviceType: page.service.name,
    provider: profile
      ? {
          name: profile.displayName,
          url: siteUrl.replace(/\/$/, ''),
        }
      : undefined,
    areaServed: [page.zone.name],
  });

  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'service_zone_page',
    {
      slug: page.slug,
      serviceSlug: page.service.slug,
      zoneSlug: page.zone.slug,
    },
    displayTitle,
  );

  return (
    <>
      <IntersectionScrollDepthTracker
        serviceSlug={page.service.slug}
        provinceSlug={page.zone.slug}
      />
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <IntersectionTemplate page={page} />
    </>
  );
}
