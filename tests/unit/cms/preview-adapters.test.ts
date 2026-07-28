import { SchemaType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { adaptBlogPostFormToPublishedDetail } from '@/lib/cms/preview/blog-post-preview-adapter';
import { adaptCaseStudyFormToPublishedDetail } from '@/lib/cms/preview/case-study-preview-adapter';
import { adaptGeoZoneFormToPublishedDetail } from '@/lib/cms/preview/geo-zone-preview-adapter';
import { adaptServiceFormToPublishedDetail } from '@/lib/cms/preview/service-preview-adapter';

describe('CMS preview adapters', () => {
  it('adaptServiceFormToPublishedDetail alinea campos con PublishedServiceDetail', () => {
    const detail = adaptServiceFormToPublishedDetail({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Ensayos in situ',
      slug: 'ensayos-in-situ',
      body: 'Cuerpo técnico',
      summary: 'Resumen',
      schemaType: SchemaType.Service,
      h1: 'Ensayos',
      metaTitle: 'Meta',
      metaDescription: 'Desc',
    });
    expect(detail.name).toBe('Ensayos in situ');
    expect(detail.slug).toBe('ensayos-in-situ');
    expect(detail.body).toBe('Cuerpo técnico');
    expect(detail.schemaType).toBe(SchemaType.Service);
  });

  it('adaptGeoZoneFormToPublishedDetail incluye provincia', () => {
    const detail = adaptGeoZoneFormToPublishedDetail({
      name: 'Madrid',
      slug: 'madrid',
      localGeology: 'Arcillas',
      body: 'Texto',
      schemaType: SchemaType.LocalBusiness,
      province: { name: 'Madrid', slug: 'madrid', ccaa: 'Madrid' },
    });
    expect(detail.province.name).toBe('Madrid');
    expect(detail.localGeology).toBe('Arcillas');
  });

  it('adaptCaseStudyFormToPublishedDetail conserva problema y solución', () => {
    const detail = adaptCaseStudyFormToPublishedDetail({
      title: 'Caso A',
      slug: 'caso-a',
      problem: 'Problema',
      solution: 'Solución',
      schemaType: SchemaType.Article,
      service: { id: 's', name: 'S', slug: 's' },
      province: { name: 'P', slug: 'p', ccaa: 'C' },
      workTypology: { name: 'W', slug: 'w' },
    });
    expect(detail.problem).toBe('Problema');
    expect(detail.teamMembers).toEqual([]);
  });

  it('adaptBlogPostFormToPublishedDetail conserva categoría', () => {
    const detail = adaptBlogPostFormToPublishedDetail({
      title: 'Post',
      slug: 'post',
      body: '<p>Hola</p>',
      schemaType: SchemaType.Article,
      category: { id: 'c', name: 'Cat', slug: 'cat' },
      teamAuthorSlug: 'autor',
    });
    expect(detail.category.slug).toBe('cat');
    expect(detail.body).toContain('Hola');
  });
});
