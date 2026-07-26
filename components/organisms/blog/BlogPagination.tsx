import Link from 'next/link';

import { PaginationLinks } from '@/components/seo/pagination-links';
import {
  buildBlogListingPath,
  buildBlogPageQueryString,
} from '@/lib/blog/catalog-config';

export type BlogPaginationProps = {
  page: number;
  totalPages: number;
  categorySlug?: string | null;
  prevUrl?: string;
  nextUrl?: string;
};

export function BlogPagination({
  page,
  totalPages,
  categorySlug,
  prevUrl,
  nextUrl,
}: BlogPaginationProps) {
  const basePath = buildBlogListingPath(categorySlug);

  if (totalPages <= 1) {
    return <PaginationLinks prev={prevUrl} next={nextUrl} />;
  }

  const prevHref =
    page > 1 ? `${basePath}${buildBlogPageQueryString(page - 1)}` : undefined;
  const nextHref =
    page < totalPages ? `${basePath}${buildBlogPageQueryString(page + 1)}` : undefined;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-brand-secondary/10 pt-6"
      aria-label="Paginación del blog"
    >
      <PaginationLinks prev={prevUrl ?? prevHref} next={nextUrl ?? nextHref} />
      <p className="text-sm text-muted">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded-sm border border-brand-secondary/20 px-3 py-2 text-sm font-medium text-brand-on-surface hover:bg-brand-neutral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            rel="prev"
            aria-label={`Página ${page - 1}`}
          >
            Anterior
          </Link>
        ) : null}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-sm border border-brand-secondary/20 px-3 py-2 text-sm font-medium text-brand-on-surface hover:bg-brand-neutral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            rel="next"
            aria-label={`Página ${page + 1}`}
          >
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
