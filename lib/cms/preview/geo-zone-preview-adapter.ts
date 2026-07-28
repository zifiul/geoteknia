import type { SchemaType } from '@prisma/client';

import type { PublishedGeoZoneDetail } from '@/lib/content/geo-zones';

export type GeoZonePreviewFormInput = {
  id?: string;
  name: string;
  slug: string;
  localGeology: string;
  operationalBase?: string | null;
  body: string;
  h1?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  schemaType: SchemaType;
  noindex?: boolean;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  province: { name: string; slug: string; ccaa: string };
};

export function adaptGeoZoneFormToPublishedDetail(
  input: GeoZonePreviewFormInput,
): PublishedGeoZoneDetail {
  return {
    id: input.id ?? '00000000-0000-4000-8000-000000000000',
    name: input.name || 'Zona',
    slug: input.slug || 'vista-previa',
    localGeology: input.localGeology,
    operationalBase: input.operationalBase ?? null,
    body: input.body,
    h1: input.h1 ?? null,
    heroImageUrl: input.heroImageUrl ?? null,
    heroImageAlt: input.heroImageAlt ?? null,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    schemaType: input.schemaType,
    noindex: input.noindex ?? false,
    province: input.province,
  };
}
