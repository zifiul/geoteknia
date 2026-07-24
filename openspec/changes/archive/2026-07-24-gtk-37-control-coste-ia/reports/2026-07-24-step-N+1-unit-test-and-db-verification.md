# Unit tests + BD — gtk-37-control-coste-ia

- Fecha: 2026-07-24
- Rama: `feature/backend-gtk-37-control-coste-ia`

## Unitarios

```text
npm run test -- tests/unit/ia/budget.test.ts → 9/9 OK
npm run test (suite completa) → 264 tests OK
```

## Base de datos

- `npx prisma migrate deploy` → migración `20260724190000_gtk_37_ai_budget_alerts` aplicada en Neon.
- Enum `ai_config_update` + tabla `ai_budget_alerts` disponibles.

## Verificación manual recomendada (escritura)

Sembrar filas en `ai_token_usage` para dos periodos y comprobar agregación en `/ia/presupuesto` con sesión admin. Restaurar línea base con skill `db-state-verify` si se insertan datos de prueba ad hoc.

## QA harness

- N+2 curl: **omitido** (sin Route Handlers).
- N+3 E2E Playwright: **omitido** — label `Backend`.
