/**
 * GTK-42 — buildSiloUrl y prioridades de sitemap.
 */
import { describe, expect, it } from 'vitest';

import { SITEMAP_PRIORITY_BY_KIND } from '@/lib/seo/sitemap-config';
import { buildSiloPath, buildSiloUrl, resolveContentUrl } from '@/lib/seo/silo-urls';

const SITE = 'https://geoteknia.es';

describe('buildSiloUrl', () => {
  it('construye URL de servicio', () => {
    expect(buildSiloUrl(SITE, 'service', { slug: 'estudios' })).toBe(
      'https://geoteknia.es/servicios/estudios',
    );
  });

  it('construye intersección servicio×zona', () => {
    expect(
      buildSiloPath('service_zone_page', {
        slug: 'ignored',
        serviceSlug: 'estudios',
        zoneSlug: 'madrid',
      }),
    ).toBe('/servicios/estudios/madrid');
  });

  it('usa canonical_url cuando existe', () => {
    expect(
      resolveContentUrl(SITE, 'service', {
        slug: 'x',
        canonicalUrl: 'https://cdn.example.com/custom',
      }),
    ).toBe('https://cdn.example.com/custom');
  });

  it('prioridad de servicio mayor que blog', () => {
    expect(SITEMAP_PRIORITY_BY_KIND.service.priority).toBeGreaterThan(
      SITEMAP_PRIORITY_BY_KIND.blog_post.priority,
    );
  });
});
