import { SchemaType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { buildMetadata, truncateMetaDescription, truncateMetaTitle } from '@/lib/seo/metadata';
import * as siloUrls from '@/lib/seo/silo-urls';

describe('buildMetadata', () => {
  const siteUrl = 'https://geoteknia.es';
  const baseSeo = {
    slug: 'estudios',
    schemaType: SchemaType.Service,
    metaTitle: 'Título corto',
    metaDescription: 'Descripción',
  };

  it('trunca meta_title a 60 caracteres', () => {
    const long = 'a'.repeat(70);
    expect(truncateMetaTitle(long)?.length).toBe(60);
  });

  it('trunca meta_description a 155 caracteres', () => {
    const long = 'b'.repeat(200);
    expect(truncateMetaDescription(long)?.length).toBe(155);
  });

  it('aplica noindex cuando el Bloque SEO lo indica', () => {
    const meta = buildMetadata(siteUrl, 'service', {
      ...baseSeo,
      noindex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('delega canonical en resolveContentUrl', () => {
    const spy = vi.spyOn(siloUrls, 'resolveContentUrl').mockReturnValue(
      'https://geoteknia.es/servicios/custom',
    );
    const meta = buildMetadata(siteUrl, 'service', {
      ...baseSeo,
      canonicalUrl: 'https://geoteknia.es/servicios/custom',
    });
    expect(spy).toHaveBeenCalled();
    expect(meta.alternates?.canonical).toBe('https://geoteknia.es/servicios/custom');
    spy.mockRestore();
  });

  it('incluye Open Graph con imagen opcional', () => {
    const meta = buildMetadata(siteUrl, 'service', baseSeo, {
      ogImageUrl: 'https://cdn.example.com/og.jpg',
    });
    expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn.example.com/og.jpg' }]);
  });
});
