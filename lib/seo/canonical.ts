/**
 * GTK-78 — utilidades de canonical y paginación para listados públicos.
 *
 * Contrato de integración (Fase 2 — consumir en generateMetadata):
 * - GTK-50, GTK-54: `buildPaginatedCanonical`, `buildListingCanonical`,
 *   `analyzeListingSearchParams`, `buildPaginationNavLinks` + `<PaginationLinks />`.
 * - GTK-49, GTK-51, GTK-53, GTK-55: listados con filtros → `resolveListingRobots`.
 * - GTK-52: entidades → seguir `buildMetadata()` (GTK-45).
 * - GTK-63: `THANK_YOU_PAGE_ROBOTS` + canonical autoreferenciado de la URL Thank You.
 *
 * `rel=prev`/`rel=next`: la Metadata API de Next.js no los soporta; usar
 * `components/seo/pagination-links.tsx` en el layout del listado.
 */
const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'dclid',
  'gbraid',
  'wbraid',
]);

export type ListingSearchAnalysis = {
  page: number;
  hasActiveFilters: boolean;
};

export function normalizeListingBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
    throw new Error('basePath de listado debe ser ruta relativa, sin origen');
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function joinSiteUrl(siteUrl: string, path: string, search?: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return search ? `${base}${normalized}?${search}` : `${base}${normalized}`;
}

export function isTrackingQueryParam(key: string): boolean {
  const lower = key.toLowerCase();
  if (lower.startsWith('utm_')) return true;
  return TRACKING_PARAMS.has(lower);
}

function parsePageParam(raw: string | null): number {
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function analyzeListingSearchParams(
  searchParams: URLSearchParams,
  allowedFilterKeys: readonly string[],
): ListingSearchAnalysis {
  const filterSet = new Set(allowedFilterKeys.map((k) => k.toLowerCase()));
  let page = 1;
  let hasActiveFilters = false;

  for (const [key, value] of searchParams.entries()) {
    if (!value.trim()) continue;
    const lower = key.toLowerCase();
    if (lower === 'page') {
      page = parsePageParam(value);
      continue;
    }
    if (isTrackingQueryParam(lower)) continue;
    if (filterSet.has(lower)) {
      hasActiveFilters = true;
    }
  }

  return { page, hasActiveFilters };
}

export type BuildListingCanonicalOptions = {
  page?: number;
  searchParams?: URLSearchParams;
};

export function buildListingCanonical(
  siteUrl: string,
  basePath: string,
  options?: BuildListingCanonicalOptions,
): string {
  let page = options?.page ?? 1;
  if (options?.searchParams) {
    const analysis = analyzeListingSearchParams(options.searchParams, []);
    page = analysis.page;
  }
  return buildPaginatedCanonical(siteUrl, basePath, page);
}

export function buildPaginatedCanonical(
  siteUrl: string,
  basePath: string,
  page: number,
): string {
  if (page < 1) {
    throw new Error('page debe ser >= 1');
  }
  const path = normalizeListingBasePath(basePath);
  if (page === 1) {
    return joinSiteUrl(siteUrl, path);
  }
  return joinSiteUrl(siteUrl, path, `page=${page}`);
}

export type PaginationNavLinks = {
  prev?: string;
  next?: string;
};

export function buildPaginationNavLinks(
  siteUrl: string,
  basePath: string,
  page: number,
  totalPages: number,
): PaginationNavLinks {
  if (totalPages < 1 || page < 1 || page > totalPages) {
    return {};
  }
  const links: PaginationNavLinks = {};
  if (page > 1) {
    links.prev = buildPaginatedCanonical(siteUrl, basePath, page - 1);
  }
  if (page < totalPages) {
    links.next = buildPaginatedCanonical(siteUrl, basePath, page + 1);
  }
  return links;
}
