# Tasks — gtk-59-acreditaciones

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-59-acreditaciones` creada y verificada.
- [x] `git status` revisado.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-59-acreditaciones --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por solicitud de implementación GTK-59 (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — ver `reports/2026-07-26-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [x] Tests unitarios `tests/unit/content/gtk-59-accreditations-readers.test.ts`.
- [x] Tests E2E `tests/e2e/gtk-59-acreditaciones.spec.ts`.

## Fase 4 — Implementación

- [x] `listPublishedAccreditationsDetailed()` en `lib/content/accreditations.ts`.
- [x] `lib/accreditations/page-config.ts`.
- [x] `CredentialCard`, `CredentialGrid`, track links.
- [x] `app/(public)/acreditaciones/page.tsx` (+ `loading.tsx` / `error.tsx`).
- [x] UI alineada con Stitch (sin tabla CPV GTK-58).

## Paso N+1: unit + BD

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+2: curl

- [x] Omitido — sin endpoints HTTP nuevos.

## Paso N+3: E2E Playwright

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] Actualización mínima si aplica.

## Gate 2 + Fase 8 — Archive

- [x] `require-code-review`; archive + sync specs (`2026-07-26-gtk-59-acreditaciones`).
