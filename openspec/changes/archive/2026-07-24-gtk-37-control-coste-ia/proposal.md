# Proposal — gtk-37-control-coste-ia

> US: [GTK-37 — Control de coste de IA: presupuesto mensual, agregación y alerta](https://linear.app/geoteknia/issue/GTK-37/control-de-coste-de-ia-presupuesto-mensual-agregacion-y-alerta)
> Labels: `Backend`, `Feature` | Dependencias: GTK-25 (RBAC ✅), GTK-22 (audit ✅), GTK-27 (email ✅), modelos `ai_budget_config` / `ai_token_usage` (GTK-16 ✅) | Consumido por: [GTK-38](https://linear.app/geoteknia/issue/GTK-38) (`assertWithinBudget`)

## Why

Sin presupuesto mensual configurable, agregación de gasto y alertas idempotentes, las generaciones con Claude pueden disparar sobrecostes sin visibilidad ni freno operativo. Materializa RNF-IA (límite mensual + alerta al umbral + registro de tokens) y el riesgo R2 de arquitectura.

## What Changes

- **Migración Prisma:** tabla `ai_budget_alerts` (marcador durable de alerta por periodo) + enum `AuditAction.ai_config_update`.
- **Dominio:** `lib/ia/budget.ts` (`getCurrentSpend`, `getActiveBudget`, `assertWithinBudget`, `checkThresholdAndNotify`, `currentBillingPeriodUtc`), `lib/ia/cost-report.ts`, `lib/ia/errors.ts`, schemas Zod de configuración.
- **Email:** plantilla `lib/ia/emails/budget-alert.tsx` + envío best-effort vía `sendEmail`.
- **Admin:** `app/(admin)/ia/presupuesto/` — Server Action de configuración (`ai.configure`) y vista de reporte (`ai.read`, efectivamente admin-only).
- **Auditoría:** cambios de presupuesto con `ai_config_update` (mustAudit).
- **Env/seed:** `IA_DEFAULT_MONTHLY_BUDGET_EUR` opcional para config global inicial.
- **Docs:** ampliar `backend-standards.md` §9.2 con contrato de `assertWithinBudget` para GTK-38.
- **QA:** Vitest + verificación BD; **sin** curl N+2 (Server Actions); **sin** E2E N+3 (label `Backend`).

## Capabilities

### New Capabilities

- `ai-budget-control`: presupuesto mensual, guardarraíl soft, alerta por umbral y reporte de coste.

### Modified Capabilities

- (ninguna spec viva existente obligatoria; extiende contabilidad GTK-16)

## Impact

- **Código:** `lib/ia/*`, `lib/audit/*`, `app/(admin)/ia/presupuesto/*`, tests `tests/unit/ia/**`.
- **BD:** `ai_budget_alerts`, enum `AuditAction`.
- **API:** Server Actions documentadas en `api-spec.yml` (`x-geoteknia-serverActions`); sin Route Handlers REST nuevos.
- **Seguridad:** RBAC estricto; sin PII en logs/metadata de auditoría; emails de alerta internos no logueados en claro.

## Fuera de alcance

- Integración en el endpoint de generación GTK-38 (solo se expone el contrato del guardarraíl).
- Reserva atómica de presupuesto bajo concurrencia (límite soft aceptado).
- UI rica de dashboards (vista mínima de reporte en este ticket).
- E2E Playwright (label `Backend`).
