import type { Metadata } from 'next';

import { PaginationLinks } from '@/components/seo/pagination-links';
import {
  analyzeListingSearchParams,
  buildListingCanonical,
  buildPaginationNavLinks,
} from '@/lib/seo/canonical';
import { resolveListingRobots } from '@/lib/seo/robots-rules';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Filtros simulados del catálogo de casos (GTK-50). */
const LAB_FILTER_KEYS = ['servicio', 'provincia', 'tipologia'] as const;

const LAB_TOTAL_PAGES = 5;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toUrlSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) params.append(key, entry);
      }
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const params = toUrlSearchParams(resolved);
  const analysis = analyzeListingSearchParams(params, LAB_FILTER_KEYS);
  const canonical = buildListingCanonical(siteUrl, '/dev-seo/canonical-lab', {
    page: analysis.page,
    searchParams: params,
  });

  const listingRobots = resolveListingRobots({
    hasActiveFilters: analysis.hasActiveFilters,
    page: analysis.page,
  });
  const robots =
    analysis.hasActiveFilters === true
      ? listingRobots
      : { index: false, follow: true };

  return {
    title: 'Laboratorio canonical GTK-78',
    robots,
    alternates: { canonical },
  };
}

export default async function CanonicalLabPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const params = toUrlSearchParams(resolved);
  const analysis = analyzeListingSearchParams(params, LAB_FILTER_KEYS);
  const nav = buildPaginationNavLinks(
    siteUrl,
    '/dev-seo/canonical-lab',
    analysis.page,
    LAB_TOTAL_PAGES,
  );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PaginationLinks prev={nav.prev} next={nav.next} />
      <h1>Laboratorio canonical / robots (GTK-78)</h1>
      <p className="text-sm text-gray-600">
        Prueba UTM, filtros simulados y paginación sin rutas /blog o /proyectos.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium">Página</dt>
          <dd>{analysis.page}</dd>
        </div>
        <div>
          <dt className="font-medium">Filtros activos</dt>
          <dd>{analysis.hasActiveFilters ? 'sí' : 'no'}</dd>
        </div>
      </dl>
    </div>
  );
}
