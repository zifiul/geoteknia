import { SchemaType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  buildArticleSchema,
  buildCreativeWorkSchema,
  buildFaqPageSchema,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildServiceSchema,
  SCHEMA_TYPE_LABEL,
} from '@/lib/seo/jsonld';

describe('jsonld builders', () => {
  it('buildServiceSchema omite image si falta', () => {
    const json = buildServiceSchema({
      name: 'Estudios',
      url: 'https://geoteknia.es/servicios/estudios',
    });
    expect(json['@type']).toBe('Service');
    expect(json.image).toBeUndefined();
    expect(json.name).toBe('Estudios');
  });

  it('buildServiceSchema extiende serviceType, provider y areaServed', () => {
    const json = buildServiceSchema({
      name: 'Estudios geotécnicos',
      url: 'https://geoteknia.es/servicios/estudios-geotecnicos',
      serviceType: 'Estudios geotécnicos',
      provider: { name: 'Geoteknia', url: 'https://geoteknia.es' },
      areaServed: ['Madrid', ''],
    });
    expect(json.serviceType).toBe('Estudios geotécnicos');
    expect(json.provider).toEqual({
      '@type': 'Organization',
      name: 'Geoteknia',
      url: 'https://geoteknia.es',
    });
    expect(json.areaServed).toEqual(['Madrid']);
  });

  it('buildServiceSchema omite provider y areaServed vacíos', () => {
    const json = buildServiceSchema({
      name: 'Estudios',
      url: 'https://geoteknia.es/servicios/estudios',
      provider: { name: '   ' },
      areaServed: [],
    });
    expect(json.provider).toBeUndefined();
    expect(json.areaServed).toBeUndefined();
  });

  it('buildLocalBusinessSchema usa ProfessionalService opcional', () => {
    const json = buildLocalBusinessSchema({
      name: 'Geo',
      url: 'https://geoteknia.es',
      useProfessionalService: true,
    });
    expect(json['@type']).toBe('ProfessionalService');
  });

  it('buildLocalBusinessSchema extiende NAP, areaServed y catálogo', () => {
    const json = buildLocalBusinessSchema({
      name: 'Geo',
      url: 'https://geoteknia.es',
      useProfessionalService: true,
      telephone: '+34900000000',
      email: 'info@example.com',
      address: 'Calle 1, Madrid',
      areaServed: ['Madrid', 'Toledo'],
      offerCatalog: {
        name: 'Servicios',
        items: [
          {
            name: 'Estudios',
            url: 'https://geoteknia.es/servicios/estudios',
          },
        ],
      },
    });
    expect(json.telephone).toBe('+34900000000');
    expect(json.email).toBe('info@example.com');
    expect(json.areaServed).toEqual(['Madrid', 'Toledo']);
    const catalog = json.hasOfferCatalog as Record<string, unknown>;
    expect(catalog['@type']).toBe('OfferCatalog');
    expect(json.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Calle 1, Madrid',
    });
  });

  it('buildLocalBusinessSchema omite campos vacíos y aggregateRating sin reviewCount', () => {
    const json = buildLocalBusinessSchema({
      name: 'Geo',
      url: 'https://geoteknia.es',
      areaServed: [],
      aggregateRating: { ratingValue: 4.5, reviewCount: 0 },
    });
    expect(json.areaServed).toBeUndefined();
    expect(json.aggregateRating).toBeUndefined();
    expect(json.telephone).toBeUndefined();
  });

  it('buildArticleSchema incluye autor', () => {
    const json = buildArticleSchema({
      headline: 'Título',
      url: 'https://geoteknia.es/blog/cat/post',
      authorName: 'Ana',
    });
    expect(json['@type']).toBe('Article');
    expect(json.author).toEqual({ '@type': 'Person', name: 'Ana' });
  });

  it('buildArticleSchema incluye authorUrl, publisher y dateModified', () => {
    const json = buildArticleSchema({
      headline: 'Título',
      url: 'https://geoteknia.es/blog/cat/post',
      authorName: 'Ana',
      authorUrl: 'https://geoteknia.es/equipo/ana',
      dateModified: '2024-07-01T00:00:00.000Z',
      publisher: { name: 'Geoteknia', url: 'https://geoteknia.es' },
    });
    expect(json.author).toEqual({
      '@type': 'Person',
      name: 'Ana',
      url: 'https://geoteknia.es/equipo/ana',
    });
    expect(json.publisher).toEqual({
      '@type': 'Organization',
      name: 'Geoteknia',
      url: 'https://geoteknia.es',
    });
    expect(json.dateModified).toBe('2024-07-01T00:00:00.000Z');
  });

  it('buildCreativeWorkSchema', () => {
    const json = buildCreativeWorkSchema({
      name: 'Caso',
      url: 'https://geoteknia.es/proyectos/caso',
    });
    expect(json['@type']).toBe('CreativeWork');
  });

  it('buildPersonSchema mapea worksFor y alumniOf', () => {
    const json = buildPersonSchema({
      name: 'Técnico',
      worksFor: 'Geoteknia',
      alumniOf: 'UPM',
    });
    expect(json.worksFor).toEqual({ '@type': 'Organization', name: 'Geoteknia' });
    expect(json.alumniOf).toEqual({ '@type': 'Organization', name: 'UPM' });
  });

  it('buildOrganizationSchema mapea hasCredential desde accreditations', () => {
    const json = buildOrganizationSchema({
      name: 'Geoteknia',
      credentials: [
        {
          name: 'ENAC',
          credentialType: 'certification',
          issuer: 'ENAC',
          registrationNumber: '123',
          verificationUrl: 'https://example.com/verify',
          validUntil: '2030-01-01',
        },
      ],
    });
    const creds = json.hasCredential as Record<string, unknown>[];
    const first = creds[0] as Record<string, unknown>;
    expect(first.name).toBe('ENAC');
    expect(first.credentialCategory).toBe('certification');
    expect(first.identifier).toBe('123');
  });

  it('buildFaqPageSchema', () => {
    const json = buildFaqPageSchema([
      { question: 'Q?', answer: 'A.' },
    ]);
    expect(json['@type']).toBe('FAQPage');
    const main = json.mainEntity as Record<string, unknown>[];
    expect(main[0]?.name).toBe('Q?');
  });

  it('SCHEMA_TYPE_LABEL cubre enum Prisma', () => {
    expect(SCHEMA_TYPE_LABEL[SchemaType.BreadcrumbList]).toBe('BreadcrumbList');
    expect(Object.keys(SCHEMA_TYPE_LABEL).length).toBe(8);
  });

  it('omite propiedades con caracteres peligrosos sin romper JSON', () => {
    const json = buildServiceSchema({
      name: '</script>',
      description: '& "quotes"',
      url: 'https://geoteknia.es/servicios/x',
    });
    expect(json.name).toBe('</script>');
    expect(JSON.stringify(json)).toContain('</script>');
  });
});
