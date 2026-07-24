# TDD-RED — gtk-37-control-coste-ia

- Fecha: 2026-07-24
- Suite: `tests/unit/ia/budget.test.ts`

## Casos cubiertos (funcionales + seguridad)

- `getCurrentSpend` agrega por `billing_period`.
- `getActiveBudget` prioriza override de periodo.
- `assertWithinBudget` bloquea en tope / permite bajo tope / fail-open sin config.
- `checkThresholdAndNotify` idempotencia durable (marcador + segunda llamada).
- Schema Zod rechaza claves `modelByPageType` inválidas (SEC-3).

## Evidencia RED → GREEN

Tests escritos antes de cerrar dominio; ejecución final:

```text
npm run test -- tests/unit/ia/budget.test.ts → 9/9 passed
```

Abuse cases RBAC (SEC-1/SEC-2) cubiertos por contrato `withPermission` en Server Actions (patrón existente GTK-25); sin Route Handlers nuevos.
