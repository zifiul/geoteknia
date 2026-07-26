# Tasks — gtk-58-licitaciones

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-58-licitaciones` creada y verificada.
- [x] `git status` revisado; trabajo limitado a GTK-58.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-58-licitaciones --strict`.

## Gate 1 — revisión humana

- [x] OK (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — ver `reports/2026-07-26-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [x] Tests unitarios `tests/unit/content/gtk-58-tenders-readers.test.ts`.
- [x] Tests E2E `tests/e2e/gtk-58-licitaciones.spec.ts`.

## Fase 4 — Implementación

- [x] `lib/content/tenders-seed-data.ts` + seed idempotente en `prisma/seed.ts`.
- [x] `lib/content/tenders.ts` lectores públicos.
- [x] `lib/tenders/page-config.ts`.
- [x] `components/molecules/TurnstileWidget.tsx`.
- [x] `components/organisms/tenders/ClassificationTable.tsx`, `PublicProjects.tsx`.
- [x] `components/organisms/forms/TenderForm.tsx`.
- [x] `app/(public)/licitaciones/page.tsx` (+ `loading.tsx` / `error.tsx`).
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
- [ ] `require-code-review`; archive + sync specs.

## Decisión de alcance (PR)

- Datos masters: opción A (seed + lectores Prisma, sin CRUD admin).
- Endpoint: `/api/leads/licitacion`.
- `/acreditaciones` enlazada; página GTK-59 pendiente.
