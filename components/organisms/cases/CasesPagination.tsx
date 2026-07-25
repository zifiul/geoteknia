import Link from 'next/link';

import { PaginationLinks } from '@/components/seo/pagination-links';
import type { CaseCatalogAppliedFilters } from '@/lib/cases/catalog-search-params';
import { buildCaseCatalogQueryString } from '@/lib/cases/catalog-search-params';
import { CASE_CATALOG_BASE_PATH } from '@/lib/cases/catalog-config';

export type CasesPaginationProps = {
  page: number;
  totalPages: number;
  filters: CaseCatalogAppliedFilters;
  prevUrl?: string;
  nextUrl?: string;
};

export function CasesPagination({
  page,
  totalPages,
  filters,
  prevUrl,
  nextUrl,
}: CasesPaginationProps) {
  if (totalPages <= 1) {
    return <PaginationLinks prev={prevUrl} next={nextUrl} />;
  }

  const prevHref =
    page > 1
      ? `${CASE_CATALOG_BASE_PATH}${buildCaseCatalogQueryString(filters, page - 1)}`
      : undefined;
  const nextHref =
    page < totalPages
      ? `${CASE_CATALOG_BASE_PATH}${buildCaseCatalogQueryString(filters, page + 1)}`
      : undefined;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-brand-secondary/10 pt-6"
      aria-label="Paginación del catálogo"
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
          >
            Anterior
          </Link>
        ) : null}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-sm border border-brand-secondary/20 px-3 py-2 text-sm font-medium text-brand-on-surface hover:bg-brand-neutral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            rel="next"
          >
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
