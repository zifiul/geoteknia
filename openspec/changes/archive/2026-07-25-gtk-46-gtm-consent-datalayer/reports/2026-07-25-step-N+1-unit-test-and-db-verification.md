# N+1 — Unit tests y BD — gtk-46

- **Fecha:** 2026-07-25

## Vitest

- `tests/unit/analytics/*` (GTK-46): 11 tests OK.
- Suite `tests/unit` (excl. QA con BD sucia local): ejecutar en CI; QA `gtk24`/`gtk28-31` fallaron por estado Neon local no relacionado con GTK-46.

## Base de datos

**NO APLICABLE** — sin escrituras Prisma en este change. El mirror E2E usa `POST /api/eventos` (append-only existente); no se verificó conteo de filas.

## Otros

- `pnpm run typecheck` OK
- `pnpm run build` OK
