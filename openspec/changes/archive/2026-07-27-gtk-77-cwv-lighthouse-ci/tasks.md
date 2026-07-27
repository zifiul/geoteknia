# Tasks — gtk-77-cwv-lighthouse-ci

## Paso 0: Rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] Crear `feature/frontend-gtk-77-cwv-lighthouse-ci` desde `main`.
- [x] Verificar rama activa y `git status` sin pisar trabajo ajeno.

## Fase 1 — SDD (Gate 1)

- [x] `proposal.md`, delta spec, `design.md` (+ threat model), `tasks.md`.
- [x] Informe Gate 1 en `reports/2026-07-27-gate-1.md`.

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers / Server Actions (`reports/2026-07-27-phase-2-contract-skip.md`).

## Fase 3 — TDD-RED

- [x] Tests Vitest `tests/unit/perf/gtk-77-lighthouse-config.test.ts`.
- [x] E2E `tests/e2e/gtk-77-cwv-lighthouse.spec.ts` (LCP priority + GTM diferido).
- [x] Ejecutar tests y confirmar RED antes de implementación (`reports/2026-07-27-step-3-tdd-red.md`).

## Fase 4 — Implementación

- [x] `lib/perf/lighthouse-phase1.cjs` + actualizar `lighthouserc.cjs` + `budget.json`.
- [x] `.github/workflows/lighthouse.yml` + scripts `package.json` (`ci:lighthouse`, `lighthouse`).
- [x] Auditoría home/servicio/blog (Stitch GTK-48/49/54-55): héroes ya con `priority`/`sizes`; seed + fixture SVG para CI.

## Paso N: Revisar y actualizar tests (OBLIGATORIO)

- [x] Ajustar tests tras implementación; suite en verde.

## Paso N+1: Tests unitarios + BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] `pnpm run test` + informe `reports/2026-07-27-step-N+1-unit-test-and-db-verification.md`.

## Paso N+2: curl endpoints (OBLIGATORIO si aplica)

- [x] Omitido — sin API nueva.

## Paso N+3: E2E Playwright (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] `pnpm run test:e2e` filtro GTK-77 + informe `reports/2026-07-27-step-N+3-e2e.md`.

## Fase 5b — Security scan

- [x] `reports/security.md`.

## Fase 6 — Code review

- [x] `reports/code-review.md` con **Veredicto: APTO**.

## Fase 7 — Docs

- [x] Actualizar `docs/technical/frontend-standards.md` (gate CI real, Fase 2).

## Fase 8 — Archive

- [x] Gate 2 aprobado → specs sincronizadas → change archivado.

## Fase 2 GTK-77 (seguimiento, no este change)

- [ ] Añadir geo-landing (GTK-51) y caso (GTK-53) a `lighthouse-phase1` cuando existan plantillas.
