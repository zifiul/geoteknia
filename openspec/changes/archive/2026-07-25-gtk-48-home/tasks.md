# Tasks — gtk-48-home

## Step 0 — Rama de feature

- [x] Crear `feature/frontend-gtk-48-home` desde `main` y verificar `git branch --show-current`.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md` (+ threat model), delta spec `public-home-page`.
- [x] Gate 1: `reports/2026-07-25-gate-1.md` (aprobación explícita del humano vía petición de implementación).

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers / Server Actions (`reports/2026-07-25-phase-2-contract-skip.md`).

## Fase 3 — TDD-RED

- [x] Tests unitarios jsonld extendido, organization, listados públicos.
- [x] Tests E2E home GTK-48.
- [x] Verificar RED y report `reports/2026-07-25-step-3-tdd-red.md`.

## Fase 4 — Implementación

- [x] Extender `lib/seo/jsonld.ts`, `lib/content/organization.ts`, listados en services/case-studies/accreditations/geo-zones.
- [x] `lib/home/*`, organismos home, `app/(public)/page.tsx`, `EngagementTrackLink`, revalidación `/`.
- [x] Alinear UI a pantallas Stitch desktop/mobile.

## Fase 5a — QA

- [x] `pnpm run test` + db-state si hay escritura (solo lectura → verificación mínima).
- [x] curl: omitido (sin API nueva).
- [x] Playwright E2E GTK-48 — report N+3.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con **Veredicto: APTO**.

## Fase 7 — Docs

- [x] `frontend-standards.md` / delta seo-utilities si aplica.

## Fase 8 — Archive

- [x] Gate 2 humano; archive + sync specs.
