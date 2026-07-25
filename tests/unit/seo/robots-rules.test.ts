import { describe, expect, it } from 'vitest';

import {
  resolveListingRobots,
  THANK_YOU_PAGE_ROBOTS,
} from '@/lib/seo/robots-rules';

describe('lib/seo/robots-rules', () => {
  describe('resolveListingRobots', () => {
    it('noindex cuando hay filtros activos', () => {
      expect(
        resolveListingRobots({ hasActiveFilters: true, page: 1 }),
      ).toEqual({ index: false, follow: true });
      expect(
        resolveListingRobots({ hasActiveFilters: true, page: 2 }),
      ).toEqual({ index: false, follow: true });
    });

    it('index en listado sin filtros (paginación curada)', () => {
      expect(
        resolveListingRobots({ hasActiveFilters: false, page: 1 }),
      ).toEqual({ index: true, follow: true });
      expect(
        resolveListingRobots({ hasActiveFilters: false, page: 4 }),
      ).toEqual({ index: true, follow: true });
    });
  });

  describe('THANK_YOU_PAGE_ROBOTS', () => {
    it('noindex y nofollow para GTK-63', () => {
      expect(THANK_YOU_PAGE_ROBOTS).toEqual({
        index: false,
        follow: false,
      });
    });
  });
});
