# Tasks — gtk-37-control-coste-ia

> US: [GTK-37](https://linear.app/geoteknia/issue/GTK-37) — Control de coste IA
> Labels: `Backend`, `Feature` | E2E N+3 omitido (label `Backend`); curl N+2 omitido (Server Actions)

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, issue Linear GTK-37.
- [x] 0.2 Crear rama `feature/backend-gtk-37-control-coste-ia` desde `main`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. Contrato Zod (fase 2)

- [x] 1.1 `lib/ia/budget-config-schema.ts` — config + tipos exportados.
- [x] 1.2 Actualizar `docs/technical/api-spec.yml` (`updateBudgetConfigAction`, página presupuesto).
- [x] 1.3 Congelar contrato antes de implementación de dominio.

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests `lib/ia/budget` (spend, active budget, assert, alert idempotente, sin config).
- [x] 2.2 Tests schema `modelByPageType` + abuse RBAC (mocks).
- [x] 2.3 Evidencia RED en `reports/2026-07-24-step-3-tdd-red.md`.

## 3. Migración y auditoría (fase 4a)

- [x] 3.1 Migración `ai_budget_alerts` + `AuditAction.ai_config_update`.
- [x] 3.2 `lib/audit/actions.ts` + `sanitize.ts` + tests audit.

## 4. Implementación (fase 4a)

- [x] 4.1 `lib/ia/budget.ts`, `cost-report.ts`, `errors.ts`, emails, `index.ts`.
- [x] 4.2 `app/(admin)/ia/presupuesto/actions.ts` + `page.tsx`.
- [x] 4.3 `lib/env.ts` + `prisma/seed.ts` (`IA_DEFAULT_MONTHLY_BUDGET_EUR`).
- [x] 4.4 Tests VERDE.

## 5. Paso N: revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Suite completa Vitest sin regresiones.

## 6. Paso N+1: unitarios + BD (OBLIGATORIO)

- [x] 6.1 `prisma migrate deploy` OK.
- [x] 6.2 Informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl (omitido)

- [x] 7.1 **Omitido** — sin Route Handlers nuevos.

## 8. Paso N+3: E2E (omitido — Backend)

- [x] 8.1 **Omitido** — E2E en US frontend futura.

## 9. Fase 5b: security-scan

- [x] 9.1 `reports/security.md`.

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` con **Veredicto: APTO**.

## 11. Fase 7: docs

- [x] 11.1 `backend-standards.md` §9.2, `data-model.md`, `api-spec.yml`, informe fase 7.

## 12. Gate 2 y archive

- [x] 12.1 OK humano Gate 2 documentado en `reports/2026-07-24-gate-2.md`.
- [x] 12.2 `openspec validate --strict`.
- [x] 12.3 Archive + sync specs (`ai-budget-governance`).
