import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogListingView } from '@/components/organisms/blog/BlogListingView';
import { JsonLd } from '@/components/seo/json-ld';
import {
  BLOG_CATALOG_FILTER_KEYS,
  BLOG_CATALOG_PAGE_SIZE,
  BLOG_INDEX_METADATA,
  buildBlogListingPath,
} from '@/lib/blog/catalog-config';
import {
  getPublishedBlogCategoryBySlug,
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
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export async function generateStaticParams() {
  const categories = await listPublishedBlogCategories();
  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getPublishedBlogCategoryBySlug(categoria);
  if (!category) {
    return { title: 'Categoría no encontrada' };
  }

  const resolved = await searchParams;
  const urlParams = toListingSearchParams(resolved);
  const analysis = analyzeListingSearchParams(urlParams, BLOG_CATALOG_FILTER_KEYS);
  const basePath = buildBlogListingPath(category.slug);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = buildListingCanonical(siteUrl, basePath, {
    page: analysis.page,
    searchParams: urlParams,
  });
  const metadataBase = resolveMetadataBase(siteUrl);

  const title =
    category.metaTitle?.trim() ||
    `${category.name} — Blog Geoteknia`;
  const description =
    category.metaDescription?.trim() ||
    category.description?.trim() ||
    BLOG_INDEX_METADATA.description;

  const robots = category.noindex
    ? { index: false as const, follow: true as const }
    : resolveListingRobots({ hasActiveFilters: false, page: analysis.page });

  return {
    metadataBase,
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title,
      description,
    },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const category = await getPublishedBlogCategoryBySlug(categoria);
  if (!category) {
    notFound();
  }

  const resolved = await searchParams;
  const urlParams = toListingSearchParams(resolved);
  const analysis = analyzeListingSearchParams(urlParams, BLOG_CATALOG_FILTER_KEYS);
  const basePath = buildBlogListingPath(category.slug);

  const [categories, catalog] = await Promise.all([
    listPublishedBlogCategories(),
    listPublishedBlogPostsByCategory({
      categorySlug: category.slug,
      page: analysis.page,
      pageSize: BLOG_CATALOG_PAGE_SIZE,
    }),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const nav = buildPaginationNavLinks(siteUrl, basePath, catalog.page, catalog.totalPages);

  const breadcrumbSegments: BreadcrumbSegment[] = [
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: category.name, path: basePath },
  ];
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, breadcrumbSegments);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));
  const description =
    category.description?.trim() ||
    `Artículos de ${category.name.toLowerCase()} publicados por el equipo técnico de Geoteknia.`;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <BlogListingView
        title={category.name}
        description={description}
        categories={navCategories}
        activeCategorySlug={category.slug}
        catalog={catalog}
        categorySlug={category.slug}
        categoryNameForEmpty={category.name}
        prevUrl={nav.prev}
        nextUrl={nav.next}
        trackerListName={`Blog — ${category.slug}`}
      />
    </>
  );
}
