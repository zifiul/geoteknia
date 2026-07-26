import Image from 'next/image';
import Link from 'next/link';

import type { PublishedBlogCatalogItem } from '@/lib/content/blog-faqs';
import { buildSiloPath } from '@/lib/seo/silo-urls';

import { ArticleCardSelectLink } from './ArticleCardSelectLink';

export type ArticleCardProps = {
  item: PublishedBlogCatalogItem;
};

function formatPublishedDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function ArticleCard({ item }: ArticleCardProps) {
  const href = buildSiloPath('blog_post', {
    slug: item.slug,
    categorySlug: item.category.slug,
  });
  const publishedLabel = formatPublishedDate(item.publishedAt);
  const authorHref = `/equipo/${item.teamAuthorSlug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-brand-neutral/40">
        {item.heroImageUrl ? (
          <Image
            src={item.heroImageUrl}
            alt={item.heroImageAlt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full min-h-[10rem] items-center justify-center text-sm text-muted"
            aria-hidden
          >
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-brand-neutral/80 px-2.5 py-0.5 text-xs font-medium text-brand-secondary">
          {item.category.name}
        </span>
        <h2 className="mt-3 font-display text-lg font-semibold text-brand-on-surface">
          <ArticleCardSelectLink href={href} item={item}>
            {item.title}
          </ArticleCardSelectLink>
        </h2>
        {item.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm text-muted">{item.excerpt}</p>
        ) : null}
        <p className="mt-auto flex flex-wrap gap-x-2 gap-y-1 pt-4 text-xs text-muted">
          {publishedLabel ? <span>{publishedLabel}</span> : null}
          {publishedLabel ? <span aria-hidden>·</span> : null}
          <Link
            href={authorHref}
            className="font-medium text-brand-accent hover:underline"
          >
            {item.teamAuthorName}
          </Link>
          {item.readingMinutes != null && item.readingMinutes > 0 ? (
            <>
              <span aria-hidden>·</span>
              <span>{item.readingMinutes} min lectura</span>
            </>
          ) : null}
        </p>
        <ArticleCardSelectLink
          href={href}
          item={item}
          className="mt-3 inline-flex text-sm font-semibold text-brand-accent hover:underline"
        >
          Leer artículo
        </ArticleCardSelectLink>
      </div>
    </article>
  );
}
