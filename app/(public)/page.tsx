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

const HOME_TITLE = 'Geoteknia — Ingeniería geotécnica';
const HOME_DESCRIPTION =
  'Estudios geotécnicos, ensayos y soluciones para edificación y obra civil. Recorridos por perfil, servicios y acreditaciones.';

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
  const displayName = data.profile?.displayName ?? 'Geoteknia';
  const primaryPath = data.personaPaths[0];

  const jsonLd =
    data.profile !== null
      ? buildHomeLocalBusinessJsonLd(data.profile, data.services)
      : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <HomeHero
        displayName={displayName}
        heroImageUrl={data.heroImageUrl}
        heroImageAlt={data.heroImageAlt}
        primaryHref={primaryPath?.href ?? '/servicios'}
        primaryLabel={primaryPath?.ctaLabel ?? 'Explorar servicios'}
        primaryContentType={primaryPath?.contentType ?? 'service'}
        primaryContentId={primaryPath?.contentId ?? 'servicios-index'}
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
