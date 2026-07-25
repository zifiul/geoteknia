import { describe, expect, it } from 'vitest';

import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { SITEMAP_PRIORITY_BY_KIND } from '@/lib/seo/sitemap-config';
import type { SitemapPriorityKind } from '@/lib/seo/sitemap-config';

const SITE = 'https://geoteknia.es';

const KIND_CASES: Array<{
  kind: SitemapPriorityKind;
  params: {
    slug: string;
    serviceSlug?: string;
    zoneSlug?: string;
    categorySlug?: string;
  };
  leafPathSuffix: string;
}> = [
  { kind: 'service', params: { slug: 'estudios' }, leafPathSuffix: '/servicios/estudios' },
  { kind: 'geo_zone', params: { slug: 'madrid' }, leafPathSuffix: '/zonas/madrid' },
  {
    kind: 'service_zone_page',
    params: { slug: 'x', serviceSlug: 'estudios', zoneSlug: 'madrid' },
    leafPathSuffix: '/servicios/estudios/madrid',
  },
  { kind: 'case_study', params: { slug: 'caso-1' }, leafPathSuffix: '/proyectos/caso-1' },
  {
    kind: 'blog_post',
    params: { slug: 'post-1', categorySlug: 'geotecnia' },
    leafPathSuffix: '/blog/geotecnia/post-1',
  },
  { kind: 'team_member', params: { slug: 'ana' }, leafPathSuffix: '/equipo/ana' },
  { kind: 'machinery', params: { slug: 'sondeos' }, leafPathSuffix: '/maquinaria/sondeos' },
  { kind: 'faq_group', params: { slug: 'ensayos' }, leafPathSuffix: '/faqs/ensayos' },
];

describe('buildSiloBreadcrumbSegments', () => {
  for (const { kind, params, leafPathSuffix } of KIND_CASES) {
    it(`cubre kind ${kind}`, () => {
      const segments = buildSiloBreadcrumbSegments(kind, params, 'Leaf');
      const last = segments.at(-1);
      expect(last?.path).toBe(leafPathSuffix);
    });
  }

  it('cada SitemapPriorityKind del config tiene caso de breadcrumb', () => {
    const kinds = Object.keys(SITEMAP_PRIORITY_BY_KIND) as SitemapPriorityKind[];
    expect(kinds.every((k) => KIND_CASES.some((c) => c.kind === k))).toBe(true);
  });

  it('blog_post sin categorySlug lanza error', () => {
    expect(() =>
      buildSiloBreadcrumbSegments('blog_post', { slug: 'x' }, 'Leaf'),
    ).toThrow(/categorySlug/);
  });
});

describe('buildSiloBreadcrumbListSchema', () => {
  it('genera BreadcrumbList JSON-LD', () => {
    const schema = buildSiloBreadcrumbListSchema(
      SITE,
      'service',
      { slug: 'estudios' },
      'Estudios',
    );
    expect(schema['@type']).toBe('BreadcrumbList');
    const list = schema.itemListElement as Array<{ item: string }>;
    expect(list.at(-1)?.item).toBe(`${SITE}/servicios/estudios`);
  });
});
