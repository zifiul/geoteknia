# Proposal — gtk-78-canonical-pagination-noindex

> US: [GTK-78 — Canonical, paginación y noindex](https://linear.app/geoteknia/issue/GTK-78/canonical-paginacion-y-noindex-gestion-transversal-de-indexabilidad)
> Dependencias ejecutables: GTK-42, GTK-45 (Done). Fase 2 (integración en `/blog`, `/proyectos`, `/gracias`) queda para GTK-50, GTK-54, GTK-63.

## Why

La indexabilidad transversal (canonical, paginación rastreable, `noindex` en thin content y Thank You) es riesgo SEO R4 crítico. `buildMetadata()` (GTK-45) ya canonicaliza entidades sin query string; faltan utilidades puras para **listados** (paginación, UTM/filtros) y reglas de robots reutilizables antes de que existan las plantillas de blog y casos.

## What Changes

- `lib/seo/canonical.ts` — `buildPaginatedCanonical`, `buildListingCanonical`, análisis de query de listado, `buildPaginationNavLinks`.
- `lib/seo/robots-rules.ts` — `resolveListingRobots`, helper Thank You `noindex`.
- `components/seo/pagination-links.tsx` — RSC con `<link rel="prev|next">` (Metadata API sin soporte nativo).
- Extensión `app/(public)/dev-seo/` — laboratorio de metadata para E2E sin `/blog` ni `/proyectos`.
- Tests Vitest exhaustivos + E2E Playwright; tests de regresión admin/sitemap (sin reimplementar GTK-42/43).
- Delta spec `seo-utilities` con requisitos de indexabilidad transversal.

## Capabilities

### New Capabilities

- _(ninguna — se extiende `seo-utilities`)_

### Modified Capabilities

- `seo-utilities`: canonical de listados, paginación, robots de listado/Thank You, prev/next y contrato de integración para plantillas futuras.

## Impact

- **Código:** `lib/seo/canonical.ts`, `lib/seo/robots-rules.ts`, `components/seo/pagination-links.tsx`, `app/(public)/dev-seo/**`, tests.
- **API / contrato:** sin Route Handlers — **fase 2 del harness omitida**.
- **SEO:** RNF-SEO §8.4; no altera sitemap-sources ni `buildMetadata()` de entidad.
- **Fase 2 (fuera de este change):** GTK-49/50/51/52/53/54/55/63 consumen helpers en `generateMetadata`.

## Fuera de alcance

- Páginas reales `/blog`, `/proyectos`, `/gracias` (GTK-54, GTK-50, GTK-63).
- Lighthouse CI gate global (GTK-77).
- Cambios en `sitemap-sources.ts` o lógica de entidad en `metadata.ts`.
