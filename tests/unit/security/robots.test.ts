/**
 * GTK-26 / GTK-42 — robots.txt excluye /admin y referencia sitemap.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('app/robots.ts', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('incluye Disallow para el prefijo /admin', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://geoteknia.es');
    const robots = (await import('@/app/robots')).default;
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
    expect(disallows.some((path: string) => path.startsWith('/gracias'))).toBe(
      true,
    );
  });
});
