# Tasks — gtk-62-faqs-schema-faqpage

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-62-faqs-schema-faqpage` creada y verificada.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [x] `openspec validate gtk-62-faqs-schema-faqpage --strict`.

## Gate 1 — revisión humana

- [x] OK (ver `reports/2026-07-26-gate-1.md`).

## Fase 2 — Contrato

- [x] Omitida — ver `reports/2026-07-26-phase-2-contract-skip.md`.

## Fase 3 — TDD-RED

- [x] Tests unitarios `tests/unit/content/gtk-62-faq-readers.test.ts`.
- [x] Tests E2E `tests/e2e/gtk-62-faqs-schema-faqpage.spec.ts`.

## Fase 4 — Implementación

- [x] Lectores en `lib/content/blog-faqs.ts`.
- [x] `lib/faq/catalog-config.ts`, `FaqAccordion`, páginas `/faqs`, `ServiceFaqs`.
- [x] UI alineada con diseños Stitch del comentario Linear.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [x] Informe `reports/2026-07-26-step-N+1-unit-test-and-db-verification.md`.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [x] Informe `reports/2026-07-26-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [x] `docs/technical/data-model.md` — ver `reports/2026-07-26-phase-7-docs.md`.

## Gate 2 + Fase 8 — Archive

- [x] OK humano final (`reports/2026-07-26-gate-2.md`).
- [x] `require-code-review.sh`; archive + sync spec viva `public-faq-pages`.
