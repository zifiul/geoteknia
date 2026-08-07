import { describe, expect, it } from 'vitest';

import { parseUserFiltersFromSearchParams } from '@/lib/admin/user-filters-schema';

describe('parseUserFiltersFromSearchParams', () => {
  it('trata q vacío o solo espacios como sin filtro de búsqueda', () => {
    expect(parseUserFiltersFromSearchParams({ q: '' }).q).toBeUndefined();
    expect(parseUserFiltersFromSearchParams({ q: '   ' }).q).toBeUndefined();
  });

  it('conserva q con texto tras recortar espacios', () => {
    expect(parseUserFiltersFromSearchParams({ q: '  ana  ' }).q).toBe('ana');
  });
});
