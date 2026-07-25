import type { Metadata } from 'next';

/**
 * Reglas de robots para listados y Thank You (GTK-78).
 *
 * Integración Fase 2: GTK-50/54 en listados; GTK-63 → `THANK_YOU_PAGE_ROBOTS`.
 */
export type ListingRobotsInput = {
  hasActiveFilters: boolean;
  page?: number;
};

export function resolveListingRobots(
  input: ListingRobotsInput,
): NonNullable<Metadata['robots']> {
  if (input.hasActiveFilters) {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}

/** Robots por defecto para páginas Thank You (GTK-63). */
export const THANK_YOU_PAGE_ROBOTS = {
  index: false,
  follow: false,
} as const satisfies NonNullable<Metadata['robots']>;
