/**
 * GTK-26 — robots.txt excluye /admin.
 */
import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';

describe('app/robots.ts', () => {
  it('incluye Disallow para el prefijo /admin', () => {
    const route = robots();
    const rawRules = route.rules;
    const rules = Array.isArray(rawRules)
      ? rawRules
      : rawRules
        ? [rawRules]
        : [];
    const disallows = rules.flatMap((rule) => {
      const raw = rule.disallow;
      if (!raw) return [] as string[];
      return Array.isArray(raw) ? raw : [raw];
    });

    expect(disallows.some((path: string) => path.startsWith('/admin'))).toBe(
      true,
    );
  });
});
