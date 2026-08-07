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

export type HomePersonaIcon = 'calculator' | 'map' | 'verified';

export type HomePersonaPath = {
  id: 'p1' | 'p2' | 'p3';
  title: string;
  mobileTitle: string;
  description: string;
  ctaLabel: string;
  href: string;
  contentType: string;
  contentId: string;
  icon: HomePersonaIcon;
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
  zones: Awaited<ReturnType<typeof listPublishedGeoZones>>,
): HomePersonaPath[] {
  const zone = zones[0] ?? null;

  return [
    {
      id: 'p1',
      title: 'Arquitectos',
      mobileTitle: 'Calculadora de alcance',
      description: 'Datos precisos para el cálculo estructural.',
      ctaLabel: 'Calculadora y presupuesto',
      href: '/calculadora',
      contentType: 'calculator',
      contentId: 'calculadora',
      icon: 'calculator',
    },
    {
      id: 'p2',
      title: 'Promotores',
      mobileTitle: 'Zonas y casos de éxito',
      description: 'Viabilidad y optimización de costes desde el cimiento.',
      ctaLabel: 'Zonas y casos',
      href: zone ? buildSiloPath('geo_zone', { slug: zone.slug }) : '/proyectos',
      contentType: zone ? 'geo_zone' : 'case_study_index',
      contentId: zone?.id ?? 'proyectos',
      icon: 'map',
    },
    {
      id: 'p3',
      title: 'Licitaciones',
      mobileTitle: 'Acreditaciones y solvencia',
      description: 'Solvencia técnica para concursos públicos.',
      ctaLabel: 'Acreditaciones y licitaciones',
      href: '/licitaciones',
      contentType: 'tender_index',
      contentId: 'licitaciones',
      icon: 'verified',
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
      personaPaths: buildPersonaPaths(zones),
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
