# Tasks — GTK-75

## Step 0 — Rama

- [x] Rama `feature/frontend-gtk-75-cms-editorial-workflow` desde `main`.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, threat model.
- [x] Gate 1: revisión humana — **APTO** (2026-07-28).

## Fase 2 — Contrato

- [x] Schemas Zod `schedulePublishAtSchema` en `lib/content/schemas/workflow.ts`.

## Fase 3 — TDD-RED

- [x] `tests/unit/content/content-revisions-list.test.ts`
- [x] `tests/unit/content/schedule-publication.test.ts`
- [x] `tests/e2e/gtk-75-cms-editorial-workflow.spec.ts`

## Fase 4a — Backend ligero

- [x] `listContentRevisions` en `lib/content/revisions.ts`
- [x] `lib/content/schedule.ts` + acciones en `actions.ts`

## Fase 4b — Frontend

- [x] Componentes CMS workflow + integración `ContentEditor` / `loadCmsEditorPage`
- [x] UI alineada a Stitch A5 (comentario Linear)

## Fase 5a — QA

- [x] N+1: Vitest + informe `reports/2026-07-28-step-N+1-unit-test.md`
- [ ] N+3: E2E Playwright GTK-75 en entorno con seed (smoke añadido; no bloquea Gate 2)
- [x] Informes en `reports/`

## Fase 5b — Security scan

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con **Veredicto: APTO**

## Fase 7 — Docs

- [x] `data-model.md`, `frontend-standards.md`

## Fase 8 — Archive

- [x] Gate 2 aprobado 2026-07-28.
- [x] `require-code-review` OK.
- [x] Spec viva `openspec/specs/admin-cms-editorial-workflow/spec.md` sincronizada.
- [x] Change movido a `openspec/changes/archive/2026-07-28-gtk-75-cms-editorial-workflow/`.
