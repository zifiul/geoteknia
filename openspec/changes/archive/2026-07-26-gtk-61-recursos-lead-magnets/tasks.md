# Tasks — gtk-61-recursos-lead-magnets

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-61-recursos-lead-magnets-gated` creada y verificada desde `main`.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-61-recursos-lead-magnets --strict`.

## Gate 1 — revisión humana

- [x] OK (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Actualizar `docs/technical/api-spec.yml` con `GET /api/recursos/download`.

## Fase 3 — TDD-RED

- [x] Tests unitarios lectores + token + `GET /api/recursos/download`.
- [x] Tests E2E `tests/e2e/gtk-61-recursos-lead-magnets.spec.ts`.

## Fase 4 — Implementación

- [x] Lectores en `lib/content/lead-magnets.ts`; silo `lead_magnet`.
- [x] `app/api/recursos/download/route.ts`, páginas `/recursos`, `ResourceForm`, `ResourceCard`.
- [x] UI alineada con diseños Stitch del comentario Linear.

## Paso N: revisar tests existentes (OBLIGATORIO)

- [x] Confirmar que tests GTK-30 siguen verdes.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+2: curl (si aplica)

- [x] Documentado en informe N+1 (validación vía tests de handler).

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] Actualizar `docs/technical/api-spec.yml`; informe fase 7.

## Gate 2 + Fase 8 — Archive

- [x] OK humano final (`reports/2026-07-26-gate-2.md`).
- [x] `require-code-review.sh`; archive + spec viva `public-resource-pages`.
