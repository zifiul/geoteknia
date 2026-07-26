import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ArticleScrollDepthTracker } from '@/components/analytics/ArticleScrollDepthTracker';
import { ArticleBody } from '@/components/organisms/blog/ArticleBody';
import { AuthorBox } from '@/components/organisms/blog/AuthorBox';
import { RelatedServices } from '@/components/organisms/blog/RelatedServices';
import { TableOfContents } from '@/components/organisms/blog/TableOfContents';
import { BudgetCta } from '@/components/organisms/cta/BudgetCta';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedBlogPostBySlug,
  listPublishedBlogPostParams,
  listRelatedServicesByBlogPost,
} from '@/lib/content/blog-faqs';
import { getOrganizationProfile } from '@/lib/content/organization';
import { sanitizeCmsHtml } from '@/lib/content/sanitize-cms-html';
import { getPublishedTeamMemberBySlug } from '@/lib/content/team-machinery';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildArticleSchema } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { resolveContentUrl } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ categoria: string; slug: string }>;
};

function formatReadingLabel(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) {
    return null;
  }
  return `${minutes} min de lectura`;
}

function formatPublishedDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export async function generateStaticParams() {
  return listPublishedBlogPostParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const post = await getPublishedBlogPostBySlug(categoria, slug);
  if (!post) {
    return { title: 'Artículo no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = {
    slug: post.slug,
    schemaType: post.schemaType,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    noindex: post.noindex,
    h1: post.h1,
  };
  const base = buildMetadata(siteUrl, 'blog_post', seoBlock, {
    ogImageUrl: post.heroImageUrl,
    siloExtra: { categorySlug: post.category.slug },
  });
  const author = await getPublishedTeamMemberBySlug(post.teamAuthorSlug);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      ...(author ? { authors: [author.fullName] } : {}),
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { categoria, slug } = await params;
  const post = await getPublishedBlogPostBySlug(categoria, slug);
  if (!post) {
    notFound();
  }

  const [author, relatedServices, profile] = await Promise.all([
    getPublishedTeamMemberBySlug(post.teamAuthorSlug),
    listRelatedServicesByBlogPost(post.id),
    getOrganizationProfile(),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const displayTitle = post.h1?.trim() || post.title;
  const sanitizedBody = sanitizeCmsHtml(post.body);
  const articleUrl = resolveContentUrl(siteUrl, 'blog_post', {
    slug: post.slug,
    canonicalUrl: post.canonicalUrl,
  }, { categorySlug: post.category.slug });

  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'blog_post',
    { slug: post.slug, categorySlug: post.category.slug },
    displayTitle,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  const authorProfileUrl =
    author != null
      ? resolveContentUrl(siteUrl, 'team_member', { slug: author.slug })
      : null;

  const articleSchema = buildArticleSchema({
    headline: displayTitle,
    description: post.metaDescription ?? post.excerpt,
    url: articleUrl,
    imageUrl: post.heroImageUrl,
    datePublished: post.publishedAt?.toISOString() ?? null,
    dateModified: post.updatedAt.toISOString(),
    authorName: author?.fullName ?? null,
    authorUrl: authorProfileUrl,
    publisher: profile
      ? { name: profile.displayName, url: siteUrl.replace(/\/$/, '') || siteUrl }
      : null,
  });

  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'blog_post',
    { slug: post.slug, categorySlug: post.category.slug },
    displayTitle,
  );

  const readingLabel = formatReadingLabel(post.readingMinutes);
  const publishedLabel = formatPublishedDate(post.publishedAt);
  const primaryService = relatedServices[0] ?? null;
  const heroAlt =
    post.heroImageAlt?.trim() || `Imagen destacada: ${displayTitle}`;

  return (
    <>
      <ArticleScrollDepthTracker
        categorySlug={post.category.slug}
        articleSlug={post.slug}
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <header className="max-w-[70ch]">
          <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
            {post.category.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            {displayTitle}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-brand-on-surface/85">{post.excerpt}</p>
          ) : null}
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            {publishedLabel ? <span>{publishedLabel}</span> : null}
            {readingLabel ? (
              <>
                {publishedLabel ? <span aria-hidden>·</span> : null}
                <span>{readingLabel}</span>
              </>
            ) : null}
          </p>
        </header>

        {post.heroImageUrl ? (
          <div className="relative mt-10 aspect-[21/9] w-full overflow-hidden rounded-lg bg-brand-neutral/30 shadow-md">
            <Image
              src={post.heroImageUrl}
              alt={heroAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <div className="min-w-0 max-w-[70ch] lg:max-w-none">
            <ArticleBody html={sanitizedBody} />
            {author ? (
              <div className="mt-12">
                <AuthorBox author={author} />
              </div>
            ) : null}
            {primaryService ? (
              <div className="mt-10 hidden md:block">
                <BudgetCta
                  serviceId={primaryService.id}
                  serviceSlug={primaryService.slug}
                  serviceName={primaryService.name}
                />
              </div>
            ) : null}
          </div>
          {post.toc ? (
            <TableOfContents entries={post.toc} className="order-first lg:order-none" />
          ) : null}
        </div>
      </article>
      <RelatedServices services={relatedServices} />
      {primaryService ? (
        <div className="md:hidden">
          <BudgetCta
            serviceId={primaryService.id}
            serviceSlug={primaryService.slug}
            serviceName={primaryService.name}
          />
        </div>
      ) : null}
    </>
  );
}
