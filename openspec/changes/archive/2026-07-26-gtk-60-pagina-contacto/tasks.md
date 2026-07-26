# Tasks — gtk-60-pagina-contacto

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-60-pagina-contacto` creada y verificada desde `main`.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-60-pagina-contacto --strict`.

## Gate 1 — revisión humana

- [x] OK implícito por petición de implementación completa (`reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers ni Server Actions nuevos.

## Fase 3 — TDD-RED

- [x] Tests unitarios wrapper JSON-LD + NAP + `buildUbicacionHref`.
- [x] Tests E2E `tests/e2e/gtk-60-pagina-contacto.spec.ts`.

## Fase 4 — Implementación

- [x] `lib/contact/page-config.ts`, `local-business-schema.ts`, `public-nap.ts`.
- [x] `ContactChannels`, `ContactConversionCtas`, `ContactNapSection`, `MapEmbed`.
- [x] `app/(public)/contacto/page.tsx` + extender `cta-query` si hace falta.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] Actualizar doc enriquecido si procede; informe fase 7.

## Gate 2 + Fase 8 — Archive

- [x] OK humano final; archive + spec viva `public-contact-page`.
