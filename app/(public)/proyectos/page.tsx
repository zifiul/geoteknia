import type { Metadata } from 'next';

import { CaseCard } from '@/components/organisms/cases/CaseCard';
import { CaseCatalogEmpty } from '@/components/organisms/cases/CaseCatalogEmpty';
import { CaseCatalogViewTracker } from '@/components/organisms/cases/CaseCatalogViewTracker';
import { CaseFilters } from '@/components/organisms/cases/CaseFilters';
import { CasesPagination } from '@/components/organisms/cases/CasesPagination';
import { PaginationLinks } from '@/components/seo/pagination-links';
import { JsonLd } from '@/components/seo/json-ld';
import {
  CASE_CATALOG_FILTER_KEYS,
  CASE_CATALOG_METADATA,
  CASE_CATALOG_PAGE_SIZE,
  CASE_CATALOG_BASE_PATH,
} from '@/lib/cases/catalog-config';
import {
  readCaseCatalogFiltersFromSearchParams,
  toCatalogUrlSearchParams,
} from '@/lib/cases/catalog-search-params';
import { listPublishedCaseStudiesCatalog, listPublishedCaseStudyProjectYears } from '@/lib/content/case-studies';
import { listOperationalProvinces, listWorkTypologies } from '@/lib/content/masters';
import { listPublishedServices } from '@/lib/content/services';
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
  { name: 'Proyectos', path: CASE_CATALOG_BASE_PATH },
];

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const params = toCatalogUrlSearchParams(resolved);
  const analysis = analyzeListingSearchParams(params, CASE_CATALOG_FILTER_KEYS);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = buildListingCanonical(siteUrl, CASE_CATALOG_BASE_PATH, {
    page: analysis.page,
    searchParams: params,
  });
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: CASE_CATALOG_METADATA.title,
    description: CASE_CATALOG_METADATA.description,
    alternates: { canonical },
    robots: resolveListingRobots({
      hasActiveFilters: analysis.hasActiveFilters,
      page: analysis.page,
    }),
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: CASE_CATALOG_METADATA.title,
      description: CASE_CATALOG_METADATA.description,
    },
  };
}

export default async function CaseStudiesCatalogPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const urlParams = toCatalogUrlSearchParams(resolved);
  const analysis = analyzeListingSearchParams(urlParams, CASE_CATALOG_FILTER_KEYS);
  const appliedFilters = readCaseCatalogFiltersFromSearchParams(resolved);

  const [services, provinces, typologies, years, catalog] = await Promise.all([
    listPublishedServices({ take: 200 }),
    listOperationalProvinces(),
    listWorkTypologies(),
    listPublishedCaseStudyProjectYears(),
    listPublishedCaseStudiesCatalog(
      {
        serviceSlug: appliedFilters.servicio,
        workTypologySlug: appliedFilters.tipologia,
        provinceSlug: appliedFilters.provincia,
        yearRaw: appliedFilters.ano,
      },
      { page: analysis.page, pageSize: CASE_CATALOG_PAGE_SIZE },
    ),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const nav = buildPaginationNavLinks(
    siteUrl,
    CASE_CATALOG_BASE_PATH,
    catalog.page,
    catalog.totalPages,
  );

  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  const filterYears =
    years.length > 0
      ? years
      : Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - index);

  const hasActiveFilters = analysis.hasActiveFilters;

  return (
    <>
      <PaginationLinks prev={nav.prev} next={nav.next} />
      <JsonLd data={breadcrumbJsonLd} />
      <CaseCatalogViewTracker items={catalog.items} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Solvencia en obra
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Proyectos y casos de estudio
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Explora estudios geotécnicos reales por servicio, tipología, provincia y año. Filtra y
              comparte la URL para revisar condiciones similares a tu proyecto.
            </p>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:w-72" aria-label="Filtros del catálogo">
            <CaseFilters
              filters={appliedFilters}
              services={services}
              provinces={provinces}
              typologies={typologies}
              years={filterYears}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <p
              className="text-sm text-muted"
              aria-live="polite"
              aria-atomic="true"
              data-testid="case-catalog-result-count"
            >
              {catalog.total === 0
                ? '0 resultados'
                : `${catalog.total} ${catalog.total === 1 ? 'resultado' : 'resultados'}`}
            </p>

            {catalog.items.length === 0 ? (
              <div className="mt-8">
                <CaseCatalogEmpty hasActiveFilters={hasActiveFilters} />
              </div>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((item) => (
                  <li key={item.id}>
                    <CaseCard item={item} />
                  </li>
                ))}
              </ul>
            )}

            <CasesPagination
              page={catalog.page}
              totalPages={catalog.totalPages}
              filters={appliedFilters}
              prevUrl={nav.prev}
              nextUrl={nav.next}
            />
          </div>
        </div>
      </div>
    </>
  );
}
