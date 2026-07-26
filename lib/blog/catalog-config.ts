/** Listado público del blog (GTK-54), alineado con GTK-78 — solo paginación `page`. */
export const BLOG_CATALOG_FILTER_KEYS = [] as const;

export const BLOG_CATALOG_BASE_PATH = '/blog';

export const BLOG_CATALOG_PAGE_SIZE = 12;

export const BLOG_INDEX_METADATA = {
  title: 'Blog de ingeniería geotécnica — Geoteknia',
  description:
    'Artículos técnicos sobre normativa, geología y estudios geotécnicos. Conocimiento aplicado para promotores e ingeniería.',
} as const;

export function buildBlogListingPath(categorySlug?: string | null): string {
  if (!categorySlug?.trim()) {
    return BLOG_CATALOG_BASE_PATH;
  }
  return `${BLOG_CATALOG_BASE_PATH}/${categorySlug.trim()}`;
}

export function buildBlogPageQueryString(page: number): string {
  if (page <= 1) return '';
  return `?page=${page}`;
}
