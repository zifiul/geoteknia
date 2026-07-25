# QA N+1 — gtk-48-home (2026-07-25)

## Vitest

- `pnpm run test` — **402 passed** (incl. jsonld, organization, gtk-48-published-reads).

## Verificación BD

- Change de solo lectura pública; sin escrituras de prueba. `db-state-verify`: no aplicable.

## curl (N+2)

- Omitido — sin Route Handlers nuevos.

## Playwright (N+3)

- `pnpm run test:e2e -- tests/e2e/gtk48-home.spec.ts` — **3 passed** (tras `pnpm run build`, `CI=true` para servidor fresco).

## Lint / typecheck

- `pnpm run lint` — 0 errores (warnings preexistentes en otros ficheros).
- `pnpm run typecheck` — OK.
