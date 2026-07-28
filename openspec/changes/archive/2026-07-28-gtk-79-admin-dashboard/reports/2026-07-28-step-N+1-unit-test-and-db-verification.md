# Paso N+1 — unit + BD (GTK-79)

**Fecha:** 2026-07-28

## Unit

```text
pnpm exec vitest run tests/unit/admin/dashboard-metrics.test.ts tests/unit/projects/project-list-where.test.ts
```

Resultado: 11 tests passed.

## Base de datos

- Solo lecturas agregadas; sin migraciones ni seeds de negocio.
- Agregador CMS: 8 `groupBy` + conteos programados/publicados en paralelo.

Estado BD: sin escrituras de prueba persistentes en este paso.
