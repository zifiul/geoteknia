import type { Metadata } from 'next';

import { BlogListingView } from '@/components/organisms/blog/BlogListingView';
import { JsonLd } from '@/components/seo/json-ld';
import {
  BLOG_CATALOG_BASE_PATH,
  BLOG_CATALOG_FILTER_KEYS,
  BLOG_CATALOG_PAGE_SIZE,
  BLOG_INDEX_METADATA,
} from '@/lib/blog/catalog-config';
import {
  listPublishedBlogCategories,
  listPublishedBlogPostsByCategory,
} from '@/lib/content/blog-faqs';
import { env } from '@/lib/env';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import {
  analyzeListingSearchParams,
  buildListingCanonical,
  buildPaginationNavLinks,
} from '@/lib/seo/canonical';
import { resolveListingRobots } from '@/lib/seo/robots-rules';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Blog', path: BLOG_CATALOG_BASE_PATH },
];

function toListingSearchParams(
  resolved: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }
  return params;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const params = toListingSearchParams(resolved);
  const analysis = analyzeListingSearchParams(params, BLOG_CATALOG_FILTER_KEYS);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = buildListingCanonical(siteUrl, BLOG_CATALOG_BASE_PATH, {
    page: analysis.page,
    searchParams: params,
  });
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: BLOG_INDEX_METADATA.title,
    description: BLOG_INDEX_METADATA.description,
    alternates: { canonical },
    robots: resolveListingRobots({ hasActiveFilters: false, page: analysis.page }),
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: BLOG_INDEX_METADATA.title,
      description: BLOG_INDEX_METADATA.description,
    },
  };
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const urlParams = toListingSearchParams(resolved);
  const analysis = analyzeListingSearchParams(urlParams, BLOG_CATALOG_FILTER_KEYS);

  const [categories, catalog] = await Promise.all([
    listPublishedBlogCategories(),
    listPublishedBlogPostsByCategory({
      page: analysis.page,
      pageSize: BLOG_CATALOG_PAGE_SIZE,
    }),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const nav = buildPaginationNavLinks(
    siteUrl,
    BLOG_CATALOG_BASE_PATH,
    catalog.page,
    catalog.totalPages,
  );

  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <BlogListingView
        title="Blog de ingeniería geotécnica"
        description={BLOG_INDEX_METADATA.description}
        categories={navCategories}
        activeCategorySlug={null}
        catalog={catalog}
        prevUrl={nav.prev}
        nextUrl={nav.next}
        trackerListName="Blog — todos"
      />
    </>
  );
}
