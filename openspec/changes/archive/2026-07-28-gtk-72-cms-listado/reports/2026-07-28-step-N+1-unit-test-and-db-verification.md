# QA — paso N+1 unit + BD (2026-07-28)

## Vitest

```
pnpm exec vitest run tests/unit/admin/cms-content-queries.test.ts
pnpm exec vitest run tests/unit/admin/dashboard-metrics.test.ts
```

Resultado: **7 + 6 tests OK**.

## TypeScript

`pnpm exec tsc --noEmit` — OK.

## db-state-verify

Listado de solo lectura; sin mutaciones en tests unitarios. No se requirió snapshot/restore Neon para este paso.

## curl

Omitido — sin Route Handlers nuevos.

## E2E (N+3)

`tests/e2e/gtk-72-cms-listado.spec.ts` añadido; ejecutar en CI o local con `DATABASE_URL`, `TWOFA_ENCRYPTION_KEY` y app en marcha:

```
pnpm exec playwright test tests/e2e/gtk-72-cms-listado.spec.ts
```
