# Tasks — gtk-78-canonical-pagination-noindex

> US: GTK-78 — Canonical, paginación y noindex
> Labels Linear: `Feature`, `Frontend` (E2E Playwright **sí**).
> Contrato API: **omitido** — sin Route Handlers ni Server Actions nuevos.
> Fase 2 ticket: integración en plantillas reales (GTK-50/54/63) — **no** tareas de este change.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, GTK-78 en Linear, `lib/seo/metadata.ts`, `docs/GTK-78-canonical-paginacion-noindex-enriquecido.md`.
- [x] 0.2 Crear rama `feature/frontend-gtk-78-canonical-pagination-noindex` desde `main`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 `tests/unit/seo/canonical.test.ts` (paginación, UTM, paths, SEC-1).
- [x] 1.2 `tests/unit/seo/robots-rules.test.ts` (`resolveListingRobots`, Thank You).
- [x] 1.3 Regresión GTK-42/43 en `gtk-78-seo-regression.test.ts`.
- [x] 1.4 E2E `tests/e2e/gtk78-canonical-lab.spec.ts`.
- [x] 1.5 Evidencia en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación (4a lib + 4b dev-seo)

- [x] 2.1 `lib/seo/canonical.ts`.
- [x] 2.2 `lib/seo/robots-rules.ts`.
- [x] 2.3 `components/seo/pagination-links.tsx`.
- [x] 2.4 `app/(public)/dev-seo/canonical-lab/page.tsx` + metadata.
- [x] 2.5 Comentarios de contrato GTK-49–55/63 en módulos.

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Suites GTK-45/metadata y E2E existentes en verde.

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build`.
- [x] 4.2 BD: **NO APLICABLE**.
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas curl (OBLIGATORIO)

- [x] 5.1 Smoke documentado (equivalente E2E tras `next start`).
- [x] 5.2 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md`.

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `gtk78-canonical-lab.spec.ts` en verde (tras `build`).
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.

## 7. Security scan (5b)

- [x] 7.1 `reports/security.md` (SAST/SCA heredados).

## 8. Documentación

- [x] 8.1 `frontend-standards.md` §6.
- [x] 8.2 Sin cambios `api-spec.yml` / `data-model.md`.

## 9. Code review

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO`.

## 10. Archive (tras Gate 2 humano)

- [x] Archivar change y sincronizar spec viva `seo-utilities`.
