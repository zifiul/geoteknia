# Tasks — gtk-67-click-to-call-whatsapp

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-67-click-to-call-whatsapp` creada y verificada.
- [x] `git status` revisado.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-67-click-to-call-whatsapp --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por solicitud de implementación GTK-67 (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — ver `reports/2026-07-26-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [x] Tests unitarios organización, `cta-query`, `build-whatsapp-message`.
- [x] Tests E2E `tests/e2e/gtk-67-click-to-call-whatsapp.spec.ts`.

## Fase 4 — Implementación

- [x] Dominio/lib + componentes layout y `TenderMailtoLink` (Stitch showcase).
- [x] Integración licitaciones + `ServiceContactStrip` / `load-service-page`.

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

- [x] `data-model.md` — contrato plantilla WhatsApp.

## Gate 2 + Fase 8 — Archive

- [x] OK humano 2026-07-26; `require-code-review` OK; archivado en `archive/2026-07-26-gtk-67-click-to-call-whatsapp`.
- [x] Spec viva: `openspec/specs/public-segmented-contact-channels/spec.md`.
