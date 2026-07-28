import type { SchemaType } from '@prisma/client';

import type { PublishedServiceDetail } from '@/lib/content/services';

export type ServicePreviewFormInput = {
  id?: string;
  name: string;
  slug: string;
  summary?: string | null;
  body: string;
  methodology?: unknown;
  applicableNorms?: string | null;
  deliverables?: unknown;
  h1?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  schemaType: SchemaType;
  noindex?: boolean;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
};

export function adaptServiceFormToPublishedDetail(
  input: ServicePreviewFormInput,
): PublishedServiceDetail {
  return {
    id: input.id ?? '00000000-0000-4000-8000-000000000000',
    name: input.name || 'Servicio',
    slug: input.slug || 'vista-previa',
    summary: input.summary ?? null,
    body: input.body,
    methodology: input.methodology ?? [],
    applicableNorms: input.applicableNorms ?? null,
    deliverables: input.deliverables ?? [],
    h1: input.h1 ?? null,
    heroImageUrl: input.heroImageUrl ?? null,
    heroImageAlt: input.heroImageAlt ?? null,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    schemaType: input.schemaType,
    noindex: input.noindex ?? false,
  };
}
