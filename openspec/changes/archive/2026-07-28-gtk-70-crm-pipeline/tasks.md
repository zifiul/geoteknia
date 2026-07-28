# Tasks — gtk-70-crm-pipeline

## Step 0 — Rama

- [x] `feature/frontend-gtk-70-crm-pipeline` creada y verificada

## Fase 1 — SDD

- [x] proposal, design, delta spec, tasks

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers; filtros Zod existentes (GTK-34)

## Fase 3 — TDD RED

- [x] `tests/unit/projects/board-utils.test.ts`
- [x] Actualizar `tests/unit/projects/project-queries.test.ts` (lead en select)

## Fase 4 — Implementación

- [x] `lib/projects/queries.ts`, `board-utils.ts`, `pipeline-view.ts`, `crm-filter-options.ts`, `lead-labels.ts`
- [x] CRM organisms + página + loading
- [x] `changeStateAction` revalida listado pipeline

## Fase 5a — QA

- [x] Vitest + report db-state
- [x] E2E `tests/e2e/gtk-70-crm-pipeline.spec.ts`

## Fase 5b — Security

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` Veredicto APTO

## Fase 7 — Docs

- [x] `frontend-standards.md` patrón kanban

## Gate 2 / Archive

- [x] Humano + archive (`openspec/changes/archive/2026-07-28-gtk-70-crm-pipeline`)
