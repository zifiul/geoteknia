# Tasks — gtk-68-admin-portal-layout

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-68-admin-portal-layout` creada y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-68-admin-portal-layout --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por solicitud de implementación (`reports/2026-07-27-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers de negocio nuevos.

## Fase 3 — TDD-RED

- [x] Tests unitarios nav + audit; E2E `gtk-68-admin-portal.spec.ts`.

## Fase 4 — Implementación

- [x] Migración `access_denied`, layout portal, componentes Stitch, logout action.

## Paso N+1: unit + BD (OBLIGATORIO)

- [x] `reports/2026-07-27-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO)

- [x] `reports/2026-07-27-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] `data-model.md`, `frontend-standards.md`, spec viva `openspec/specs/admin-portal-layout/spec.md`.

## Gate 2 + Fase 8 — Archive

- [x] OK humano (`reports/2026-07-27-gate-2.md`); archive ejecutado.
