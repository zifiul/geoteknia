/**
 * GTK-42 — XML de imágenes y robots extendido.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildImageSitemapXml } from '@/lib/seo/build-image-sitemap-xml';

describe('buildImageSitemapXml', () => {
  it('incluye namespace image y escapa caption (SEC-3)', () => {
    const xml = buildImageSitemapXml([
      {
        pageUrl: 'https://geoteknia.es/servicios/a',
        imageLoc: 'https://cdn.example.com/1.jpg',
        caption: 'A & B <test>',
      },
    ]);
    expect(xml).toContain('xmlns:image=');
    expect(xml).toContain('A &amp; B &lt;test&gt;');
    expect(xml).not.toContain('<image:caption>A & B');
  });

  it('omite image:caption sin alt/title', () => {
    const xml = buildImageSitemapXml([
      {
        pageUrl: 'https://geoteknia.es/servicios/a',
        imageLoc: 'https://cdn.example.com/1.jpg',
      },
    ]);
    expect(xml).not.toContain('image:caption');
  });
});

describe('app/robots.ts', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('referencia Sitemap con NEXT_PUBLIC_SITE_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://geoteknia.es');
    const robots = (await import('@/app/robots')).default;
    const route = robots();
    expect(route.sitemap).toBe('https://geoteknia.es/sitemap.xml');
  });
});
