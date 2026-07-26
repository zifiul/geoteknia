import type { SitemapPriorityKind } from '@/lib/seo/sitemap-config';
import {
  buildSiloPath,
  type SiloUrlParams,
} from '@/lib/seo/silo-urls';

export type BreadcrumbSegment = {
  name: string;
  path: string;
};

export type BreadcrumbListItem = {
  position: number;
  name: string;
  item: string;
};

function joinSiteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Segmentos de navegación del silo (GTK-45). GTK-47 consumirá estos datos para UI.
 */
export function buildSiloBreadcrumbSegments(
  kind: SitemapPriorityKind,
  params: SiloUrlParams,
  leafName: string,
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ name: 'Inicio', path: '/' }];

  switch (kind) {
    case 'service':
      segments.push({ name: 'Servicios', path: '/servicios' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'geo_zone':
      segments.push({ name: 'Zonas', path: '/zonas' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'service_zone_page': {
      if (!params.serviceSlug || !params.zoneSlug) {
        throw new Error(
          'service_zone_page requiere serviceSlug y zoneSlug para breadcrumbs',
        );
      }
      segments.push({ name: 'Servicios', path: '/servicios' });
      segments.push({
        name: params.serviceSlug,
        path: `/servicios/${params.serviceSlug}`,
      });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    }
    case 'case_study':
      segments.push({ name: 'Proyectos', path: '/proyectos' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'blog_post': {
      if (!params.categorySlug) {
        throw new Error('blog_post requiere categorySlug para breadcrumbs');
      }
      segments.push({ name: 'Blog', path: '/blog' });
      segments.push({
        name: params.categorySlug,
        path: `/blog/${params.categorySlug}`,
      });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    }
    case 'team_member':
      segments.push({ name: 'Equipo', path: '/equipo' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'machinery':
      segments.push({ name: 'Maquinaria', path: '/maquinaria' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'faq_group':
      segments.push({ name: 'FAQs', path: '/faqs' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    case 'lead_magnet':
      segments.push({ name: 'Recursos', path: '/recursos' });
      segments.push({
        name: leafName,
        path: buildSiloPath(kind, params),
      });
      break;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }

  return segments;
}

export function breadcrumbSegmentsToListItems(
  siteUrl: string,
  segments: BreadcrumbSegment[],
): BreadcrumbListItem[] {
  return segments.map((segment, index) => ({
    position: index + 1,
    name: segment.name,
    item: joinSiteUrl(siteUrl, segment.path),
  }));
}

export function buildBreadcrumbListSchemaFromItems(
  items: BreadcrumbListItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry) => ({
      '@type': 'ListItem',
      position: entry.position,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildSiloBreadcrumbListSchema(
  siteUrl: string,
  kind: SitemapPriorityKind,
  params: SiloUrlParams,
  leafName: string,
): Record<string, unknown> {
  const segments = buildSiloBreadcrumbSegments(kind, params, leafName);
  const items = breadcrumbSegmentsToListItems(siteUrl, segments);
  return buildBreadcrumbListSchemaFromItems(items);
}
