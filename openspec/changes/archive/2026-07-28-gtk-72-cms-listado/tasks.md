# Tasks — gtk-72-cms-listado

## Step 0 — Rama

- [x] `feature/frontend-gtk-72-cms-listado` creada y verificada

## Fase 1 — SDD

- [x] proposal, design, delta spec, tasks

## Fase 2 — Contrato

- [x] `lib/admin/cms-filters-schema.ts` (Zod filtros)
- [x] Sin cambios `api-spec.yml` (solo lectura server-only)

## Fase 3 — TDD RED

- [x] `tests/unit/admin/cms-content-queries.test.ts`

## Fase 4 — Implementación

- [x] `lib/admin/cms-content-types.ts`, `cms-content-queries.ts`, `cms-workflow-labels.ts`, `cms-list-href.ts`
- [x] UI CMS + página + loading
- [x] Dashboard sin `findCmsQuickEditHref`
- [x] E2E `tests/e2e/gtk-72-cms-listado.spec.ts`

## Fase 5a — QA

- [x] Vitest + db-state-verify report
- [x] E2E spec añadido (ejecución local/CI documentada)

## Fase 5b — Security

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` Veredicto APTO

## Fase 7 — Docs

- [x] `frontend-standards.md` si aplica

## Gate 2 / Archive

- [x] Humano + archive
