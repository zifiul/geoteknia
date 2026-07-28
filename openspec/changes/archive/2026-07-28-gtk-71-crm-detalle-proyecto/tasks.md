# Tasks — gtk-71-crm-detalle-proyecto

## Step 0 — Rama

- [x] Rama `feature/frontend-gtk-71-crm-detalle-proyecto` creada y verificada

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, `tasks.md`
- [x] `openspec validate gtk-71-crm-detalle-proyecto --strict`

## Fase 2 — Contrato

- [x] Omitida — `reports/2026-07-28-phase-2-contract.md`

## Fase 3 — TDD-RED

- [x] Tests `state-transition-targets.test.ts` en VERDE

## Fase 4 — Implementación

- [x] Componentes CRM detalle + `page.tsx` + `loading.tsx`
- [x] Export util en `lib/projects/index.ts`

## Fase 5a — QA

- [x] Vitest + report N+1
- [x] Suite E2E añadida + report N+3
- [ ] Ejecución E2E con evidencia (bloqueo: Neon / `playwright install`)

## Fase 5b — Security

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`

## Fase 7 — Docs

- [x] `frontend-standards.md`

## Gates

- [x] Gate 1 — OK humano (`reports/2026-07-28-gate-1.md`, 2026-07-28)
- [x] Gate 2 — OK humano (`reports/2026-07-28-gate-2.md`, 2026-07-28)
