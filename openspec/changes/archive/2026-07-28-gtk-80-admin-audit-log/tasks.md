# Tasks — GTK-80

## Step 0 — Rama

- [x] Rama `feature/frontend-gtk-80-admin-audit-log` desde `main`.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, threat model.
- [x] Gate 1: revisión humana — **APTO** (2026-07-28, OK explícito).

## Fase 2 — Contrato

- [x] `lib/admin/audit-filters-schema.ts` (Zod filtros URL).

## Fase 3 — TDD-RED

- [x] `tests/unit/admin/audit-queries.test.ts`
- [x] `tests/unit/admin/audit-entity-links.test.ts`
- [x] `tests/e2e/gtk-80-admin-audit-log.spec.ts`

## Fase 4a — Backend / lectura

- [x] `audit.read` en `permissions.ts`
- [x] `lib/admin/audit-queries.ts`, `audit-entity-links.ts`, `audit-ip.ts`
- [x] Nav `Auditoría`

## Fase 4b — Frontend (Stitch A2)

- [x] Página `/admin/auditoria` + componentes `components/organisms/admin/audit/**`

## Fase 5a — QA

- [x] N+1: Vitest + informe `reports/2026-07-28-step-N+1-unit-test.md`
- [x] N+3: E2E `gtk-80-admin-audit-log.spec.ts` (requiere entorno con BD)

## Fase 5b — Security scan

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con **Veredicto: APTO**

## Fase 7 — Docs

- [x] `data-model.md` — permiso `audit.read`

## Fase 8 — Archive

- [x] Gate 2 aprobado 2026-07-28 (OK explícito).
- [x] `require-code-review` OK.
- [x] Spec viva `openspec/specs/admin-audit-log/spec.md` sincronizada.
- [x] Change movido a `openspec/changes/archive/2026-07-28-gtk-80-admin-audit-log/`.
