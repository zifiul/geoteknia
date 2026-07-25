import 'server-only';

import { unstable_cache } from 'next/cache';

import { listActiveAccreditations } from '@/lib/content/accreditations';
import { listRecentPublishedCaseStudies } from '@/lib/content/case-studies';
import { listPublishedGeoZones } from '@/lib/content/geo-zones';
import {
  getGeneralContactChannel,
  getOrganizationProfile,
  ORGANIZATION_PROFILE_CACHE_TAG,
} from '@/lib/content/organization';
import { listPublishedServices } from '@/lib/content/services';
import { SITEMAP_CACHE_TAG } from '@/lib/seo/sitemap-config';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type HomePersonaPath = {
  id: 'p1' | 'p2' | 'p3';
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  contentType: string;
  contentId: string;
};

export type HomePageData = {
  profile: Awaited<ReturnType<typeof getOrganizationProfile>>;
  channel: Awaited<ReturnType<typeof getGeneralContactChannel>>;
  services: Awaited<ReturnType<typeof listPublishedServices>>;
  caseStudies: Awaited<ReturnType<typeof listRecentPublishedCaseStudies>>;
  accreditations: Awaited<ReturnType<typeof listActiveAccreditations>>;
  personaPaths: HomePersonaPath[];
  heroImageUrl: string | null;
  heroImageAlt: string | null;
};

function buildPersonaPaths(
  services: Awaited<ReturnType<typeof listPublishedServices>>,
  zones: Awaited<ReturnType<typeof listPublishedGeoZones>>,
): HomePersonaPath[] {
  const pillar =
    services.find((service) => service.isPillar) ?? services[0] ?? null;
  const zone = zones[0] ?? null;

  return [
    {
      id: 'p1',
      title: 'Promotor y técnico de proyecto',
      description:
        'Estudios geotécnicos, ensayos y memorias para licencias y proyecto de ejecución.',
      ctaLabel: pillar ? `Ver ${pillar.name}` : 'Explorar servicios',
      href: pillar
        ? buildSiloPath('service', { slug: pillar.slug })
        : '/servicios',
      contentType: 'service',
      contentId: pillar?.id ?? 'servicios-index',
    },
    {
      id: 'p2',
      title: 'Obra en territorio',
      description:
        'Cobertura provincial, casos recientes y contacto rápido con el equipo local.',
      ctaLabel: zone ? `Zona ${zone.name}` : 'Ver zonas',
      href: zone ? buildSiloPath('geo_zone', { slug: zone.slug }) : '/zonas',
      contentType: 'geo_zone',
      contentId: zone?.id ?? 'zonas-index',
    },
    {
      id: 'p3',
      title: 'Licitaciones y acreditaciones',
      description:
        'Solvencia técnica, ENAC y documentación para concursos públicos.',
      ctaLabel: 'Acreditaciones',
      href: '/acreditaciones',
      contentType: 'accreditation_index',
      contentId: 'acreditaciones',
    },
  ];
}

const loadHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const [profile, channel, services, caseStudies, accreditations, zones] =
      await Promise.all([
        getOrganizationProfile(),
        getGeneralContactChannel(),
        listPublishedServices(),
        listRecentPublishedCaseStudies(3),
        listActiveAccreditations(),
        listPublishedGeoZones({ take: 1 }),
      ]);

    const heroSource =
      services.find((service) => service.isPillar && service.heroImageUrl) ??
      services.find((service) => service.heroImageUrl) ??
      null;

    return {
      profile,
      channel,
      services,
      caseStudies,
      accreditations,
      personaPaths: buildPersonaPaths(services, zones),
      heroImageUrl: heroSource?.heroImageUrl ?? null,
      heroImageAlt: heroSource?.heroImageAlt ?? null,
    };
  },
  ['home-page-public'],
  {
    revalidate: 3600,
    tags: [SITEMAP_CACHE_TAG, ORGANIZATION_PROFILE_CACHE_TAG],
  },
);

export async function getHomePageData(): Promise<HomePageData> {
  return loadHomePageData();
}
