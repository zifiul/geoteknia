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

  it('buildLocalBusinessSchema usa ProfessionalService opcional', () => {
    const json = buildLocalBusinessSchema({
      name: 'Geo',
      url: 'https://geoteknia.es',
      useProfessionalService: true,
    });
    expect(json['@type']).toBe('ProfessionalService');
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
