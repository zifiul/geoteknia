# Tasks — gtk-73-cms-editor

## Step 0 — Rama

- [x] Rama `feature/frontend-gtk-73-cms-editor` creada y verificada

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, `tasks.md`
- [x] `openspec validate gtk-73-cms-editor --strict`

## Fase 2 — Contrato

- [x] Omitida — `reports/2026-07-28-phase-2-contract.md`

## Fase 3 — TDD-RED

- [x] Tests adaptadores preview en VERDE

## Fase 4 — Implementación

- [x] `page.tsx`, `loading.tsx`, organismos CMS editor (servicio completo)
- [x] Adaptadores `lib/cms/preview/*`

## Fase 5a — QA

- [x] Vitest + report N+1
- [x] E2E spec + report N+3

## Fase 5b — Security

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`

## Fase 7 — Docs

- [x] `frontend-standards.md` (patrón editor + preview)

## Gates

- [x] Gate 1 — `reports/2026-07-28-gate-1.md`
- [x] Gate 2 — `reports/2026-07-28-gate-2.md`

## Pendiente producto (fuera de este archive)

- [ ] Formularios completos geo_zone / case_study / blog_post + preview fiel en UI
- [ ] Media upload con `alt_text` en editor
- [ ] Ejecución E2E con evidencia en CI/local
