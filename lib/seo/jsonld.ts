import { SchemaType } from '@prisma/client';

import {
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbListItem,
} from '@/lib/seo/breadcrumbs';

const SCHEMA_CONTEXT = 'https://schema.org';

type WithImage = { imageUrl?: string | null };

function compact<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === undefined || out[key] === null) {
      delete out[key];
    }
  }
  return out;
}

export type ServiceSchemaInput = WithImage & {
  name: string;
  description?: string | null;
  url: string;
};

export function buildServiceSchema(input: ServiceSchemaInput): Record<string, unknown> {
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
  });
}

export type LocalBusinessSchemaInput = WithImage & {
  name: string;
  description?: string | null;
  url: string;
  useProfessionalService?: boolean;
};

export function buildLocalBusinessSchema(
  input: LocalBusinessSchemaInput,
): Record<string, unknown> {
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': input.useProfessionalService ? 'ProfessionalService' : 'LocalBusiness',
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
  });
}

export type ArticleSchemaInput = WithImage & {
  headline: string;
  description?: string | null;
  url: string;
  datePublished?: string | null;
  authorName?: string | null;
};

export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  const author = input.authorName
    ? { '@type': 'Person', name: input.authorName }
    : undefined;
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
    datePublished: input.datePublished,
    author,
  });
}

export type CreativeWorkSchemaInput = WithImage & {
  name: string;
  description?: string | null;
  url: string;
};

export function buildCreativeWorkSchema(
  input: CreativeWorkSchemaInput,
): Record<string, unknown> {
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.imageUrl,
  });
}

export type PersonSchemaInput = WithImage & {
  name: string;
  url?: string | null;
  jobTitle?: string | null;
  worksFor?: string | null;
  alumniOf?: string | null;
};

export function buildPersonSchema(input: PersonSchemaInput): Record<string, unknown> {
  const worksFor = input.worksFor
    ? { '@type': 'Organization', name: input.worksFor }
    : undefined;
  const alumniOf = input.alumniOf
    ? { '@type': 'Organization', name: input.alumniOf }
    : undefined;
  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Person',
    name: input.name,
    url: input.url,
    jobTitle: input.jobTitle,
    image: input.imageUrl,
    worksFor,
    alumniOf,
  });
}

export type AccreditationCredentialInput = {
  name: string;
  credentialType?: string | null;
  issuer?: string | null;
  registrationNumber?: string | null;
  verificationUrl?: string | null;
  validUntil?: string | null;
};

export type OrganizationSchemaInput = WithImage & {
  name: string;
  url?: string | null;
  credentials?: AccreditationCredentialInput[];
};

export function buildOrganizationSchema(
  input: OrganizationSchemaInput,
): Record<string, unknown> {
  const hasCredential =
    input.credentials?.map((cred) =>
      compact({
        '@type': 'EducationalOccupationalCredential',
        name: cred.name,
        credentialCategory: cred.credentialType,
        recognizedBy: cred.issuer ? { '@type': 'Organization', name: cred.issuer } : undefined,
        identifier: cred.registrationNumber,
        url: cred.verificationUrl,
        validUntil: cred.validUntil,
      }),
    ) ?? undefined;

  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    image: input.imageUrl,
    hasCredential: hasCredential?.length ? hasCredential : undefined,
  });
}

export type FaqQuestionInput = {
  question: string;
  answer: string;
};

export function buildFaqPageSchema(
  questions: FaqQuestionInput[],
): Record<string, unknown> {
  const mainEntity = questions.map((q) =>
    compact({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    }),
  );
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity,
  };
}

export function buildBreadcrumbListSchema(
  items: BreadcrumbListItem[],
): Record<string, unknown> {
  return buildBreadcrumbListSchemaFromItems(items);
}

/** Mapa de builder por enum Prisma `SchemaType` (excepto BreadcrumbList, construido vía breadcrumbs). */
export const SCHEMA_TYPE_LABEL: Record<SchemaType, string> = {
  [SchemaType.Service]: 'Service',
  [SchemaType.Article]: 'Article',
  [SchemaType.CreativeWork]: 'CreativeWork',
  [SchemaType.Person]: 'Person',
  [SchemaType.Organization]: 'Organization',
  [SchemaType.FAQPage]: 'FAQPage',
  [SchemaType.LocalBusiness]: 'LocalBusiness',
  [SchemaType.BreadcrumbList]: 'BreadcrumbList',
};
