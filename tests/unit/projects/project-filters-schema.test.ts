/**
 * GTK-34 — projectFiltersSchema (SEC-4).
 */
import { describe, expect, it } from 'vitest';

import { projectFiltersSchema } from '@/lib/projects/project-filters-schema';

describe('projectFiltersSchema (GTK-34 / SEC-4)', () => {
  it('rechaza pageSize mayor que 100', () => {
    expect(() =>
      projectFiltersSchema.parse({ pageSize: 101 }),
    ).toThrow();
  });

  it('rechaza claves extra por .strict()', () => {
    expect(() =>
      projectFiltersSchema.parse({ page: 1, evil: 'x' }),
    ).toThrow();
  });

  it('aplica defaults de paginación', () => {
    const parsed = projectFiltersSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });
});
