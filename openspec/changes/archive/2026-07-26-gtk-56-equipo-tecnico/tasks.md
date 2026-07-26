# Tasks — gtk-56-equipo-tecnico

## Step 0 — Rama de feature

- [x] Crear `feature/frontend-gtk-56-equipo-tecnico` y verificar rama activa.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md` (+ threat model), delta spec `public-team-directory`.
- [x] Gate 1: `reports/2026-07-26-gate-1.md`.

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers (`reports/2026-07-26-phase-2-contract-skip.md`).

## Fase 3 — TDD-RED

- [x] `tests/unit/content/gtk-56-published-reads.test.ts`, `tests/unit/team/team-member-seo.test.ts`, `tests/e2e/gtk-56-equipo.spec.ts` (`reports/2026-07-26-step-3-tdd-red.md`).

## Fase 4 — Implementación

- [x] Lectores + `buildTeamMemberSeoBlock`, UI Stitch, `app/(public)/equipo/*`.

## Fase 5a — QA

- [x] `npm run test` (unidad GTK-56).
- [x] Playwright E2E GTK-56 — `reports/2026-07-26-step-N+3-playwright-e2e-verification.md`.
- [x] curl: omitido (sin API).

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` — **Veredicto: APTO**.

## Fase 7 — Docs

- [x] `frontend-standards.md`; `reports/2026-07-26-phase-7-docs.md`.

## Fase 8 — Archive

- [x] Gate 2 humano (`reports/2026-07-26-gate-2.md`); archive `2026-07-26-gtk-56-equipo-tecnico` + sync `openspec/specs/public-team-directory/spec.md`.
