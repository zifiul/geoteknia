# Tasks — gtk-69-admin-login-portal

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/admin-gtk-69-login-portal` creada y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-69-admin-login-portal --strict`.

## Gate 1 — revisión humana

- [x] OK implícito (`reports/2026-07-27-gate-1.md`).

## Fase 2 — Contrato

- [x] Reutiliza `loginInputSchema` / `loginActionResultSchema` (GTK-23).

## Fase 3 — TDD-RED

- [x] Tests unitarios + `tests/e2e/gtk-69-login-portal.spec.ts`.

## Fase 4 — Implementación

- [x] Middleware, rate limit, UI Stitch, `/admin/login`.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] `reports/2026-07-27-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO)

- [x] `reports/2026-07-27-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] `openspec/specs/admin-login-page/spec.md`.

## Gate 2 + Fase 8 — Archive

- [x] `reports/2026-07-27-gate-2.md`; archive pendiente CLI humano.
