import type { SchemaType } from '@prisma/client';

import type { PublishedBlogPostDetail } from '@/lib/content/blog-faqs';

export type BlogPostPreviewFormInput = {
  id?: string;
  title: string;
  slug: string;
  h1?: string | null;
  excerpt?: string | null;
  body: string;
  readingMinutes?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  schemaType: SchemaType;
  noindex?: boolean;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  category: { id: string; name: string; slug: string };
  teamAuthorSlug: string;
};

export function adaptBlogPostFormToPublishedDetail(
  input: BlogPostPreviewFormInput,
): PublishedBlogPostDetail {
  const now = new Date();
  return {
    id: input.id ?? '00000000-0000-4000-8000-000000000000',
    title: input.title || 'Artículo',
    slug: input.slug || 'vista-previa',
    h1: input.h1 ?? null,
    excerpt: input.excerpt ?? null,
    body: input.body,
    toc: null,
    readingMinutes: input.readingMinutes ?? null,
    publishedAt: null,
    updatedAt: now,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    schemaType: input.schemaType,
    noindex: input.noindex ?? false,
    ogImageId: null,
    heroImageUrl: input.heroImageUrl ?? null,
    heroImageAlt: input.heroImageAlt ?? null,
    category: input.category,
    teamAuthorSlug: input.teamAuthorSlug || 'autor',
  };
}
