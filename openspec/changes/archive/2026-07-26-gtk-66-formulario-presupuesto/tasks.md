# Tasks — gtk-66-formulario-presupuesto

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-66-formulario-presupuesto` creada desde `main` y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec `public-budget-form-page`, este `tasks.md`.
- [x] `openspec validate gtk-66-formulario-presupuesto --strict`.

## Gate 1 — revisión humana

- [x] `reports/2026-07-26-gate-1.md`.

## Fase 2 — Contrato

- [x] Omitida — `POST /api/leads/presupuesto` y `budgetLeadSchema` ya congelados (GTK-28).

## Fase 3 — TDD-RED

- [x] `tests/unit/forms/gtk-66-budget-wizard.test.tsx`.
- [x] `tests/e2e/gtk-66-formulario-presupuesto.spec.ts`.

## Fase 4 — Implementación

- [x] `lib/forms/lead-form-shared.ts`, `lib/forms/budget-wizard.ts`, `lib/budget/page-config.ts`.
- [x] `components/molecules/StepIndicator.tsx`.
- [x] `components/organisms/forms/budget-form/BudgetFormWizard.tsx`, `app/(public)/presupuesto/page.tsx`.
- [x] Helpers compartidos en `TenderForm.tsx`.

## Paso N: revisar tests existentes (OBLIGATORIO)

- [x] Suites GTK-28 leads presupuesto sin regresión (suite global en verde).

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] Spec viva `openspec/specs/public-budget-form-page/spec.md`.

## Gate 2 + Fase 8 — Archive

- [x] `reports/2026-07-26-gate-2.md`; change movido a `archive/2026-07-26-gtk-66-formulario-presupuesto`.
