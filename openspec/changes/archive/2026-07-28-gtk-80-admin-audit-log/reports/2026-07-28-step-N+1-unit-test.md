# QA — GTK-80 paso N+1

**Fecha:** 2026-07-28

## Comando

```bash
pnpm exec vitest run tests/unit/admin/audit-queries.test.ts tests/unit/admin/audit-entity-links.test.ts tests/unit/auth/permissions.test.ts
```

## Resultado

12 tests passed (3 files).

## BD

Solo lectura en unit tests (mocks). Seed E2E `seed-gtk80-audit.ts` inserta filas de prueba cuando se ejecuta Playwright.

## E2E

`tests/e2e/gtk-80-admin-audit-log.spec.ts` — requiere `DATABASE_URL` + seed GTK-69.
