# QA N+1 — gtk-36

Fecha: 2026-07-24

## Unitarios

```text
npx vitest run tests/unit/
→ 273 passed (incl. 18 tests en tests/unit/ia/)
```

## BD (db-state-verify)

- Test: `tests/qa/gtk-36-db.qa.test.ts`
- **Estado:** ejecutado OK tras extraer `currentBillingPeriodUtc` a `lib/ia/billing-period.ts` (evita cadena de imports con email JSX en Vitest).

## Omitidos

- N+2 curl — sin Route Handlers (label Backend).
- N+3 E2E Playwright — label `Backend`; cubrirá GTK-38.
