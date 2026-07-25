# Tasks — gtk-49-plantilla-servicio

## Step 0 — Rama

- [x] `feature/frontend-gtk-49-plantilla-servicio` creada y activa.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, threat model.
- [x] Gate 1: aprobación implícita por petición explícita de implementación del harness.

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers (`reports/phase-2-contract-skip.md`).

## Fase 3 — TDD-RED

- [x] Tests unitarios lecturas públicas + `buildServiceSchema` extendido (evidencia RED→GREEN en `reports/`).

## Fase 4 — Implementación

- [x] `lib/content` lectores + `lib/service/load-service-page.ts`
- [x] `lib/seo/jsonld.ts` extendido
- [x] Rutas y organismos Stitch
- [x] E2E `tests/e2e/gtk49-service-page.spec.ts`

## Fase 5a — QA

- [x] `npm run test`, db-state si aplica, E2E Playwright, report en `reports/`.

## Fase 5b — Security

- [x] `reports/security.md`

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`

## Fase 7 — Docs

- [x] Specs vivas: `public-service-page`, delta `seo-utilities` (GTK-49).

## Gate 2

- [x] OK humano 2026-07-25 (`reports/2026-07-25-gate-2.md`).

## Fase 8 — Archive

- [x] Movido a `openspec/changes/archive/2026-07-25-gtk-49-plantilla-servicio/`.
