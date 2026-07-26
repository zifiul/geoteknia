# QA — gtk-56-equipo-tecnico (N+1 unidad + N+3 E2E)

**Fecha:** 2026-07-26

## N+1 — Vitest

- `npm run test` — OK (incl. `gtk-56-published-reads`, `team-member-seo`).
- Sin escritura en BD en tests unitarios (mocks Prisma).

## N+2 — curl

Omitido — sin Route Handlers.

## N+3 — Playwright

- `npm run build` + `CI=true npx playwright test tests/e2e/gtk-56-equipo.spec.ts`
- 2 passed, 2 skipped (sin miembros publicados en BD de E2E).
- `/equipo` 200, slug inexistente 404.

## BD

Sin pruebas con escritura en Neon; no aplica `db-state-verify`.
