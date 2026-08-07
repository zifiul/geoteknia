import type { Metadata } from 'next';

import { HomeCtaSection } from '@/components/organisms/home/CtaSection';
import { HomeHero } from '@/components/organisms/home/Hero';
import { HomePersonaPaths } from '@/components/organisms/home/PersonaPaths';
import { HomeServicesGrid } from '@/components/organisms/home/ServicesGrid';
import { HomeTrustSignals } from '@/components/organisms/home/TrustSignals';
import { JsonLd } from '@/components/seo/json-ld';
import { env } from '@/lib/env';
import { buildHomeLocalBusinessJsonLd } from '@/lib/home/local-business-schema';
import { getHomePageData } from '@/lib/home/load-home-page';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const HOME_TITLE = 'Geoteknia — Estudios geotécnicos con respuesta en 48 h';
const HOME_DESCRIPTION =
  'Ingeniería de precisión para edificación, obra civil y rehabilitación. Servicios geotécnicos, zonas, acreditaciones ENAC y presupuesto online.';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const metadataBase = resolveMetadataBase(siteUrl);
  const canonical = new URL('/', metadataBase);

  return {
    metadataBase,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical.href,
      siteName: 'Geoteknia',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
    },
  };
}

export default async function HomePage() {
  const data = await getHomePageData();

  const jsonLd =
    data.profile !== null
      ? buildHomeLocalBusinessJsonLd(data.profile, data.services)
      : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <HomeHero
        heroImageUrl={data.heroImageUrl}
        heroImageAlt={data.heroImageAlt}
      />
      <HomePersonaPaths paths={data.personaPaths} />
      <HomeServicesGrid services={data.services} />
      <HomeTrustSignals
        caseStudies={data.caseStudies}
        accreditations={data.accreditations}
      />
      <HomeCtaSection profile={data.profile} channel={data.channel} />
    </>
  );
}
