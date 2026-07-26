import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GeoScrollDepthTracker } from '@/components/analytics/GeoScrollDepthTracker';
import { GeoAreaServedNote } from '@/components/organisms/geo/GeoAreaServedNote';
import { GeoEditorialBody } from '@/components/organisms/geo/GeoEditorialBody';
import { GeoHero } from '@/components/organisms/geo/GeoHero';
import { GeoZoneBudgetCta } from '@/components/organisms/geo/GeoZoneBudgetCta';
import { LocalGeology } from '@/components/organisms/geo/LocalGeology';
import { OperationalBase } from '@/components/organisms/geo/OperationalBase';
import { ServiceCoverage } from '@/components/organisms/geo/ServiceCoverage';
import { ZoneCases } from '@/components/organisms/geo/ZoneCases';
import { JsonLd } from '@/components/seo/json-ld';
import { countPublishedCaseStudiesForProvince } from '@/lib/content/case-studies';
import {
  getPublishedGeoZoneBySlug,
  listPublishedGeoZones,
  listServiceCoverageByZone,
} from '@/lib/content/geo-zones';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const zones = await listPublishedGeoZones({ take: 200 });
  return zones.map((zone) => ({ slug: zone.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getPublishedGeoZoneBySlug(slug);
  if (!zone) {
    return { title: 'Zona no encontrada' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = {
    slug: zone.slug,
    schemaType: zone.schemaType,
    metaTitle: zone.metaTitle,
    metaDescription: zone.metaDescription,
    canonicalUrl: zone.canonicalUrl,
    noindex: zone.noindex,
  };
  return buildMetadata(siteUrl, 'geo_zone', seoBlock, {
    ogImageUrl: zone.heroImageUrl,
  });
}

export default async function GeoZoneDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const zone = await getPublishedGeoZoneBySlug(slug);
  if (!zone) {
    notFound();
  }

  const [serviceLinks, caseCount] = await Promise.all([
    listServiceCoverageByZone(zone.id, zone.slug),
    countPublishedCaseStudiesForProvince(zone.province.slug),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const displayTitle = zone.h1?.trim() || zone.name;
  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'geo_zone',
    { slug: zone.slug },
    displayTitle,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));
  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'geo_zone',
    { slug: zone.slug },
    displayTitle,
  );

  return (
    <>
      <GeoScrollDepthTracker provinceSlug={zone.slug} />
      <JsonLd data={breadcrumbSchema} />
      <div className="pb-24 md:pb-0">
        <GeoHero zone={zone} breadcrumbItems={breadcrumbItems} />
        <LocalGeology geology={zone.localGeology} zoneName={zone.name} />
        <GeoEditorialBody body={zone.body} />
        <OperationalBase operationalBase={zone.operationalBase} zoneName={zone.name} />
        <ServiceCoverage zoneName={zone.name} links={serviceLinks} />
        <ZoneCases
          zoneName={zone.name}
          provinceSlug={zone.province.slug}
          caseCount={caseCount}
        />
        <section
          className="bg-brand-neutral/50 py-12 md:py-16"
          aria-labelledby="geo-budget-heading"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                id="geo-budget-heading"
                className="font-display text-2xl font-semibold text-brand-on-surface"
              >
                Presupuesto en {zone.name}
              </h2>
              <p className="mt-2 max-w-xl text-muted">
                Preseleccionamos la provincia en el formulario de presupuesto.
              </p>
            </div>
            <GeoZoneBudgetCta zoneSlug={zone.slug} zoneName={zone.name} className="md:w-auto" />
          </div>
        </section>
        <GeoAreaServedNote zoneName={zone.name} />
      </div>
    </>
  );
}
