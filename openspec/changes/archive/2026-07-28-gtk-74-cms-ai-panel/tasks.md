# Tasks — GTK-74

## Step 0 — Rama

- [x] Rama `feature/frontend-gtk-74-cms-ai-panel` desde GTK-73 / base acordada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, threat model.
- [x] Gate 1: revisión humana — **APTO** (2026-07-28).

## Fase 2 — Contrato

- [x] Omitida — sin cambios en Route Handlers ni schemas Zod de API.

## Fase 3 — TDD-RED

- [x] `tests/unit/cms/ai-output-merge.test.ts` (fusión por sección).
- [x] `tests/e2e/gtk-74-cms-ai-panel.spec.ts` (mock API + RBAC).

## Fase 4b — Frontend

- [x] `lib/cms/ia/*`, `lib/ia/model-labels.ts`, export `REGENERATION_SECTION_KEYS`.
- [x] Componentes CMS IA + integración `ContentEditor`.
- [x] `loadCmsEditorPage`: `canUseAi`, `promptPageType`.

## Fase 5a — QA

- [x] N+1: `pnpm exec vitest run tests/unit/cms/ai-output-merge.test.ts`
- [ ] N+3: E2E Playwright GTK-74 (opcional en CI; no bloquea Gate 2)
- [x] Informes en `reports/` (N+1, security, code-review).

## Fase 5b — Security scan

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con **Veredicto: APTO**

## Fase 7 — Docs

- [x] `frontend-standards.md` — convención panel IA GTK-74.

## Fase 8 — Archive

- [x] Gate 2 aprobado 2026-07-28.
- [x] `require-code-review` OK.
- [x] Spec viva `openspec/specs/admin-cms-ai-panel/spec.md` sincronizada.
- [x] Change movido a `openspec/changes/archive/2026-07-28-gtk-74-cms-ai-panel/`.
