# Tasks — gtk-81-admin-users

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-81-admin-users` creada y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-81-admin-users --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por solicitud de implementación (`reports/2026-07-28-gate-1.md`).

## Fase 2 — Contrato

- [x] Schemas Zod + informe (`reports/2026-07-28-phase-2-contract.md`).

## Fase 3 — TDD-RED

- [x] Tests unitarios guardrails/sesiones/schemas (RED→GREEN).

## Fase 4 — Implementación

- [x] `lib/admin/users-*`, `session` revoke, páginas y componentes Stitch.
- [x] `lib/audit/sanitize.ts` whitelist `state_change`.

## Paso N+1: unit + BD (OBLIGATORIO)

- [x] `reports/2026-07-28-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO)

- [x] `tests/e2e/gtk-81-admin-users.spec.ts` + reporte E2E.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] `frontend-standards.md` patrón listado admin entidades.

## Gate 2 + Fase 8 — Archive

- [x] OK humano (`reports/2026-07-28-gate-2.md`).
- [x] Archive ejecutado; spec viva `openspec/specs/admin-users/spec.md`.
