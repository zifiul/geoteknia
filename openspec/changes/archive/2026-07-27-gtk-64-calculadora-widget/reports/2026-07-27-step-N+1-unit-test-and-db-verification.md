# Paso N+1 — unit + BD (GTK-64)

**Fecha:** 2026-07-27

## Vitest

- `pnpm run test -- tests/unit/calculator/gtk-64-presupuesto-href.test.ts` — OK (4 tests).
- Suite completa `tests/unit` — 531 tests OK (incl. actualización GTK-77 lighthouse por `/calculadora`).

## Base de datos

- Sin escrituras en este change (solo lectura de `work_typologies` y `provinces` en RSC).
- Verificación `db-state-verify`: no aplicable.

## Typecheck

- `pnpm run typecheck` — OK.
