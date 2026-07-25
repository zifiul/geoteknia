import type { Metadata } from 'next';

import type { SeoBlockInput } from '@/lib/content/schemas/seo';
import type { SitemapPriorityKind } from '@/lib/seo/sitemap-config';
import { resolveMetadataBase } from '@/lib/seo/site-url';
import {
  resolveContentUrl,
  type SiloUrlParams,
} from '@/lib/seo/silo-urls';

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 155;

export function truncateMetaTitle(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  return trimmed.length <= META_TITLE_MAX
    ? trimmed
    : trimmed.slice(0, META_TITLE_MAX);
}

export function truncateMetaDescription(
  value: string | null | undefined,
): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  return trimmed.length <= META_DESCRIPTION_MAX
    ? trimmed
    : trimmed.slice(0, META_DESCRIPTION_MAX);
}

export type BuildMetadataOptions = {
  ogImageUrl?: string | null;
  siloExtra?: Omit<SiloUrlParams, 'slug'>;
};

/**
 * Metadata API unificada para plantillas públicas (GTK-45).
 */
export function buildMetadata(
  siteUrl: string,
  kind: SitemapPriorityKind,
  seo: SeoBlockInput,
  options?: BuildMetadataOptions,
): Metadata {
  const metadataBase = resolveMetadataBase(siteUrl);
  const canonical = resolveContentUrl(
    siteUrl,
    kind,
    { slug: seo.slug, canonicalUrl: seo.canonicalUrl },
    options?.siloExtra,
  );

  const title = truncateMetaTitle(seo.metaTitle);
  const description = truncateMetaDescription(seo.metaDescription);
  const ogImageUrl = options?.ogImageUrl?.trim();

  const robots = seo.noindex
    ? { index: false, follow: true }
    : { index: true, follow: true };

  const openGraph: Metadata['openGraph'] = {
    title: title ?? undefined,
    description: description ?? undefined,
    url: canonical,
    type: 'website',
    ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
  };

  return {
    metadataBase,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical },
    robots,
    openGraph,
  };
}
