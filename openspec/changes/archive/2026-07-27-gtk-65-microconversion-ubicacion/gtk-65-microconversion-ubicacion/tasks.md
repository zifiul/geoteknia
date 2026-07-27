# Tasks — gtk-65-microconversion-ubicacion

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-65-microconversion-ubicacion` creada y verificada.
- [x] `git status` revisado.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [ ] `openspec validate gtk-65-microconversion-ubicacion --strict`.

## Gate 1 — revisión humana

- [ ] OK implícito por solicitud de implementación GTK-65 (ver `reports/2026-07-27-gate-1.md`).

## Fase 2 — Contrato

- [ ] Omitida — ver `reports/2026-07-27-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [ ] Tests unitarios GTK-65 (`tests/unit/conversion/gtk-65-location-widget-validation.test.ts`).
- [ ] Tests E2E `tests/e2e/gtk-65-location-widget.spec.ts` (RED antes de widget).

## Fase 4 — Implementación

- [ ] `LocationWidget.tsx` (Stitch FAB + dialog/bottom sheet, Opción A).
- [ ] Montaje en `app/(public)/servicios/[slug]/page.tsx`.

## Paso N: revisar tests existentes

- [ ] Confirmar `location-lead-schema.test.ts` sigue verde.

## Paso N+1: unit + BD

- [ ] Informe `reports/2026-07-27-step-N+1-unit-test-and-db-verification.md`.

## Paso N+2: curl

- [ ] Omitido — sin endpoints HTTP nuevos (consumo de GTK-29).

## Paso N+3: E2E Playwright

- [ ] Informe `reports/2026-07-27-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [ ] `reports/security.md`.

## Fase 6 — Code review

- [ ] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [ ] `reports/2026-07-27-phase-7-docs.md` + sync spec viva si aplica.

## Gate 2 + Fase 8 — Archive

- [ ] OK humano; `require-code-review` OK; archivar change y promover spec.
