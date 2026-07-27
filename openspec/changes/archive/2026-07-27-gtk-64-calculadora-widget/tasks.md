# Tasks — gtk-64-calculadora-widget

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-64-calculadora-widget` creada y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-64-calculadora-widget --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por petición de implementación completa (`reports/2026-07-27-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers nuevos; reutiliza `calculatorInputSchema` / GTK-33.

## Fase 3 — TDD-RED

- [x] `tests/unit/calculator/gtk-64-presupuesto-href.test.ts` (href + validación cliente).
- [x] `tests/e2e/gtk-64-calculadora-widget.spec.ts`.

## Fase 4 — Implementación (4b Frontend)

- [x] `lib/calculator/page-config.ts`, `lib/calculator/presupuesto-href.ts`.
- [x] `components/organisms/calculator/CalculatorWidget.tsx`, `ResultPanel.tsx`.
- [x] `app/(public)/calculadora/page.tsx` (Stitch desktop/mobile).
- [x] Añadir `/calculadora` a `lib/perf/lighthouse-phase1.cjs`.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-27-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-27-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] Informe fase 7; spec viva `public-calculadora-page`.

## Gate 2 + Fase 8 — Archive

- [x] OK humano final (`reports/2026-07-27-gate-2.md`); archive pendiente CLI.
