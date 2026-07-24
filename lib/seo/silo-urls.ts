import type { SitemapPriorityKind } from '@/lib/seo/sitemap-config';

export type SiloUrlParams = {
  slug: string;
  serviceSlug?: string;
  zoneSlug?: string;
  categorySlug?: string;
};

function joinSiteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Patrones canónicos de URL pública (PRD §8). Fuente única para sitemap y futuro frontend.
 */
export function buildSiloPath(
  kind: SitemapPriorityKind,
  params: SiloUrlParams,
): string {
  switch (kind) {
    case 'service':
      return `/servicios/${params.slug}`;
    case 'geo_zone':
      return `/zonas/${params.slug}`;
    case 'service_zone_page': {
      if (!params.serviceSlug || !params.zoneSlug) {
        throw new Error(
          'service_zone_page requiere serviceSlug y zoneSlug para buildSiloPath',
        );
      }
      return `/servicios/${params.serviceSlug}/${params.zoneSlug}`;
    }
    case 'case_study':
      return `/proyectos/${params.slug}`;
    case 'blog_post': {
      if (!params.categorySlug) {
        throw new Error('blog_post requiere categorySlug para buildSiloPath');
      }
      return `/blog/${params.categorySlug}/${params.slug}`;
    }
    case 'team_member':
      return `/equipo/${params.slug}`;
    case 'machinery':
      return `/maquinaria/${params.slug}`;
    case 'faq_group':
      return `/faqs/${params.slug}`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function buildSiloUrl(
  siteUrl: string,
  kind: SitemapPriorityKind,
  params: SiloUrlParams,
): string {
  return joinSiteUrl(siteUrl, buildSiloPath(kind, params));
}

export function resolveContentUrl(
  siteUrl: string,
  kind: SitemapPriorityKind,
  row: {
    slug: string;
    canonicalUrl?: string | null;
  },
  extra?: Omit<SiloUrlParams, 'slug'>,
): string {
  if (row.canonicalUrl?.trim()) {
    return row.canonicalUrl.trim();
  }
  return buildSiloUrl(siteUrl, kind, { slug: row.slug, ...extra });
}
