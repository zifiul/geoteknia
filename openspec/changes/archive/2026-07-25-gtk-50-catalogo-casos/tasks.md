# Tasks — gtk-50-catalogo-casos

## Step 0 — Rama de feature

- [x] Crear `feature/frontend-gtk-50-catalogo-casos` y verificar rama activa.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md` (+ threat model), delta spec `public-case-study-catalog`.
- [x] Gate 1: aprobación implícita — petición explícita de implementación GTK-50 con diseños Stitch.

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers (`reports/2026-07-25-phase-2-contract-skip.md`).

## Fase 3 — TDD-RED

- [x] `tests/unit/content/gtk-50-catalog.test.ts`, `tests/e2e/gtk-50-catalog.spec.ts`.

## Fase 4 — Implementación

- [x] `lib/content/masters.ts`, catálogo en `case-studies.ts`, `lib/cases/*`, UI y `app/(public)/proyectos/*` alineado a Stitch.

## Fase 5a — QA

- [x] `pnpm run test` (unidad GTK-50).
- [x] Playwright E2E GTK-50 — report N+3.
- [x] curl: omitido (sin API).

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` — **Veredicto: APTO**.

## Fase 7 — Docs

- [x] Artefactos OpenSpec del change; sin cambio de estándares transversales.

## Fase 8 — Archive

- [x] Gate 2 humano (`reports/2026-07-25-gate-2.md`); archive + sync specs.
