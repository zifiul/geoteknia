# TDD-RED — gtk-48-home (2026-07-25)

Tests añadidos antes de implementación (ciclo RED verificado en implementación):

- `tests/unit/seo/jsonld.test.ts` — extensiones LocalBusiness.
- `tests/unit/content/organization.test.ts` — `areaServed` / `aggregateRating`.
- `tests/unit/content/gtk-48-published-reads.test.ts` — filtros `publicado`.
- `tests/e2e/gtk48-home.spec.ts` — home, JSON-LD, personas.

Ejecución post-impl: `pnpm exec vitest run` (402 tests) y E2E gtk48 en verde tras `pnpm run build`.
