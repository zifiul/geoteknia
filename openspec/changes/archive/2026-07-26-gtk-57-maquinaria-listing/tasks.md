# Tasks — gtk-57-maquinaria-listing

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-57-maquinaria` creada y verificada.
- [x] `git status` revisado; trabajo limitado a GTK-57.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-57-maquinaria-listing --strict`.

## Gate 1 — revisión humana

- [x] OK (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — ver `reports/2026-07-26-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [x] Tests unitarios `tests/unit/content/gtk-57-published-machinery.test.ts`.
- [x] Tests E2E `tests/e2e/gtk-57-maquinaria-listing.spec.ts`.

## Fase 4 — Implementación

- [x] `lib/content/schemas/machinery-in-situ-tests.ts` + `team-machinery.ts`.
- [x] `listPublishedMachinery()` en `lib/content/machinery.ts`.
- [x] `lib/machinery/catalog-config.ts`.
- [x] Organismos `MachineCard`, `SpecTable`, vacío, trackers.
- [x] `app/(public)/maquinaria/page.tsx` (+ `loading.tsx` / `error.tsx`).
- [x] UI alineada con diseños Stitch del comentario Linear.

## Paso N: tests existentes

- [x] Sin regresiones en typecheck/lint del change.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+2: curl

- [x] Omitido — sin endpoints HTTP nuevos.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] `docs/technical/frontend-standards.md` — ver `reports/2026-07-26-phase-7-docs.md`.

## Gate 2 + Fase 8 — Archive

- [x] OK humano final (ver `reports/2026-07-26-gate-2.md`).
- [x] `require-code-review.sh`; archive + sync specs.

## Decisión de alcance (PR)

- Sin fichas `/maquinaria/[slug]` en este change; modelo ya soporta extensión futura.
