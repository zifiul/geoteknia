import type { SchemaType } from '@prisma/client';

import type { PublishedCaseStudyDetail } from '@/lib/content/case-studies';

export type CaseStudyPreviewFormInput = {
  id?: string;
  title: string;
  slug: string;
  h1?: string | null;
  problem: string;
  solution: string;
  result?: string | null;
  testsSummary?: string | null;
  boreholesCount?: number | null;
  metersDrilled?: number | null;
  projectYear?: number | null;
  clientName?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  schemaType: SchemaType;
  noindex?: boolean;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  service: { id: string; name: string; slug: string };
  province: { name: string; slug: string; ccaa: string };
  workTypology: { name: string; slug: string };
};

export function adaptCaseStudyFormToPublishedDetail(
  input: CaseStudyPreviewFormInput,
): PublishedCaseStudyDetail {
  const now = new Date();
  return {
    id: input.id ?? '00000000-0000-4000-8000-000000000000',
    title: input.title || 'Caso de estudio',
    slug: input.slug || 'vista-previa',
    h1: input.h1 ?? null,
    problem: input.problem,
    solution: input.solution,
    result: input.result ?? null,
    testsSummary: input.testsSummary ?? null,
    boreholesCount: input.boreholesCount ?? null,
    metersDrilled: input.metersDrilled ?? null,
    projectYear: input.projectYear ?? null,
    latitude: null,
    longitude: null,
    clientName: input.clientName ?? null,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    schemaType: input.schemaType,
    noindex: input.noindex ?? false,
    publishedAt: null,
    updatedAt: now,
    ogImageId: null,
    heroImageUrl: input.heroImageUrl ?? null,
    heroImageAlt: input.heroImageAlt ?? null,
    service: input.service,
    province: input.province,
    workTypology: input.workTypology,
    teamMembers: [],
  };
}
