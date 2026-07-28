# QA — gtk-73-cms-editor (N+1)

**Fecha:** 2026-07-28

## Vitest

- `pnpm exec vitest run tests/unit/cms/preview-adapters.test.ts` — 4/4 OK
- Suite completa `pnpm test` — 578 tests OK

## BD

Sin mutaciones destructivas en tests unitarios. E2E crea servicios borrador con slug único `e2e-gtk73-*` (limpieza manual si aplica).

## E2E (N+3)

- Spec: `tests/e2e/gtk-73-cms-editor.spec.ts`
- Ejecución local: requiere `DATABASE_URL`, `TWOFA_ENCRYPTION_KEY` y seed GTK-69.
