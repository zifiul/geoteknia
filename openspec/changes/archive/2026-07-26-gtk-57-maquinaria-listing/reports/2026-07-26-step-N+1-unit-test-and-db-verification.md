# Paso N+1 — gtk-57-maquinaria-listing (2026-07-26)

## Vitest

```
pnpm exec vitest run tests/unit/content/gtk-57-published-machinery.test.ts
```

- 4 tests passed (filtro editorial, foto/servicios, nulls, JSON inválido).

## Base de datos

- Tests con mocks Prisma; sin escritura en Neon.

## Regresión

- `pnpm run typecheck` OK.
