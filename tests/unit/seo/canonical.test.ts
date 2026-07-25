import { describe, expect, it } from 'vitest';

import {
  analyzeListingSearchParams,
  buildListingCanonical,
  buildPaginatedCanonical,
  buildPaginationNavLinks,
  isTrackingQueryParam,
  normalizeListingBasePath,
} from '@/lib/seo/canonical';

const SITE = 'https://geoteknia.es';

describe('lib/seo/canonical', () => {
  describe('normalizeListingBasePath', () => {
    it('añade slash inicial y quita trailing slash', () => {
      expect(normalizeListingBasePath('blog/')).toBe('/blog');
      expect(normalizeListingBasePath('/proyectos')).toBe('/proyectos');
    });

    it('SEC-1: rechaza basePath con esquema o protocol-relative', () => {
      expect(() => normalizeListingBasePath('https://evil.test/x')).toThrow();
      expect(() => normalizeListingBasePath('//evil.test/x')).toThrow();
    });
  });

  describe('buildPaginatedCanonical', () => {
    it('página 1 apunta a la URL limpia sin query', () => {
      expect(buildPaginatedCanonical(SITE, '/blog', 1)).toBe(
        'https://geoteknia.es/blog',
      );
    });

    it('página N autoreferencia ?page=N', () => {
      expect(buildPaginatedCanonical(SITE, '/blog', 2)).toBe(
        'https://geoteknia.es/blog?page=2',
      );
      expect(buildPaginatedCanonical(SITE, 'proyectos/', 3)).toBe(
        'https://geoteknia.es/proyectos?page=3',
      );
    });

    it('rechaza page menor que 1', () => {
      expect(() => buildPaginatedCanonical(SITE, '/blog', 0)).toThrow();
    });
  });

  describe('buildListingCanonical', () => {
    it('ignora UTM y tracking al derivar canonical (misma URL limpia)', () => {
      const clean = buildListingCanonical(SITE, '/blog', { page: 1 });
      expect(clean).toBe('https://geoteknia.es/blog');
      expect(
        buildListingCanonical(SITE, '/blog', {
          page: 1,
          searchParams: new URLSearchParams('utm_source=x&gclid=1'),
        }),
      ).toBe(clean);
    });

    it('paginación en listing canonical sin filtros en query', () => {
      expect(
        buildListingCanonical(SITE, '/blog', {
          page: 2,
          searchParams: new URLSearchParams('utm_medium=email&page=2'),
        }),
      ).toBe('https://geoteknia.es/blog?page=2');
    });
  });

  describe('isTrackingQueryParam', () => {
    it('detecta utm_* y clics de ads', () => {
      expect(isTrackingQueryParam('utm_source')).toBe(true);
      expect(isTrackingQueryParam('gclid')).toBe(true);
      expect(isTrackingQueryParam('servicio')).toBe(false);
    });
  });

  describe('analyzeListingSearchParams', () => {
    const filterKeys = ['servicio', 'provincia', 'tipologia'] as const;

    it('detecta filtros activos para robots (no van al canonical)', () => {
      const params = new URLSearchParams('servicio=sondeos&page=2');
      const analysis = analyzeListingSearchParams(params, filterKeys);
      expect(analysis.page).toBe(2);
      expect(analysis.hasActiveFilters).toBe(true);
      expect(
        buildListingCanonical(SITE, '/proyectos', {
          page: analysis.page,
          searchParams: params,
        }),
      ).toBe('https://geoteknia.es/proyectos?page=2');
    });

    it('sin filtros, solo page', () => {
      const analysis = analyzeListingSearchParams(
        new URLSearchParams('page=2'),
        filterKeys,
      );
      expect(analysis.hasActiveFilters).toBe(false);
      expect(analysis.page).toBe(2);
    });
  });

  describe('buildPaginationNavLinks', () => {
    it('genera prev/next absolutos en páginas intermedias', () => {
      const links = buildPaginationNavLinks(SITE, '/blog', 2, 5);
      expect(links.prev).toBe('https://geoteknia.es/blog');
      expect(links.next).toBe('https://geoteknia.es/blog?page=3');
    });

    it('sin prev en página 1 ni next en última', () => {
      expect(buildPaginationNavLinks(SITE, '/blog', 1, 3).prev).toBeUndefined();
      expect(buildPaginationNavLinks(SITE, '/blog', 3, 3).next).toBeUndefined();
    });
  });
});
