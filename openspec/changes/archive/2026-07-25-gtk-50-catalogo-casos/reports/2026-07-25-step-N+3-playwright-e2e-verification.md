# QA — GTK-50 — N+1 unit + N+3 E2E

**Fecha:** 2026-07-25  
**Rama:** `feature/frontend-gtk-50-catalogo-casos`

## N+1 Vitest

- `tests/unit/content/gtk-50-catalog.test.ts` — 7 tests OK.
- Sin escritura en BD (mocks).

## N+2 curl

- Omitido — sin Route Handlers nuevos.

## N+3 Playwright

- `tests/e2e/gtk-50-catalog.spec.ts` — 5 tests OK (tras `pnpm run build` + `CI=true` para servidor fresco en :3010).

## Manual sugerido

- `/proyectos?provincia=<slug>` → `noindex` + canonical `/proyectos`.
- `/proyectos?page=2` → canonical con `page=2` y `rel=prev`.
