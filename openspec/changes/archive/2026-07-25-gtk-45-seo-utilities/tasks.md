# Tasks — gtk-45-seo-utilities

> US: GTK-45 — Utilidades SEO: helpers JSON-LD, Metadata API y canonical
> Labels Linear: `Frontend`, `CHORE` (E2E Playwright **sí**; no es label `Backend`).
> Contrato API: **omitido** — sin Route Handlers ni Server Actions nuevos.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/frontend-standards.md` §6, descripción Linear GTK-45 y `lib/seo/` existente.
- [x] 0.2 Crear rama `feature/frontend-gtk-45-utilidades-seo` desde `main`.
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 Tests `tests/unit/seo/json-ld-escape.test.ts` (SEC-1: `</script>`, comillas, `&`).
- [x] 1.2 Tests por builder en `tests/unit/seo/jsonld.test.ts` (un caso por `SchemaType` principal).
- [x] 1.3 Tests `tests/unit/seo/metadata.test.ts` (truncado, noindex, spy/mock `resolveContentUrl`).
- [x] 1.4 Tests `tests/unit/seo/breadcrumbs.test.ts` por `SitemapPriorityKind` aplicable.
- [x] 1.5 Test componente `tests/unit/seo/json-ld-component.test.tsx` (un script por bloque).
- [x] 1.6 E2E `tests/e2e/gtk45-seo-dev-page.spec.ts` (canonical + JSON-LD + payload peligroso).
- [x] 1.7 Ejecutar Vitest y Playwright; evidencia RED en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación (4a backend/lib + 4b frontend)

- [x] 2.1 `lib/seo/json-ld-escape.ts`.
- [x] 2.2 `lib/seo/jsonld.ts` (builders tipados).
- [x] 2.3 `lib/seo/metadata.ts` (`buildMetadata`).
- [x] 2.4 `lib/seo/breadcrumbs.ts`.
- [x] 2.5 `components/seo/json-ld.tsx` (RSC).
- [x] 2.6 Página de prueba `app/(public)/dev-seo/page.tsx` con `noindex` y datos de prueba.

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Confirmar suites `tests/unit/seo/site-url.test.ts`, `silo-urls.test.ts` y E2E GTK-43/44 en verde.
- [x] 3.2 Ajustar solo si la página de prueba o imports globales afectan smoke existente.

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build` en verde.
- [x] 4.2 BD: **NO APLICABLE** (sin escrituras Prisma).
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Smoke `GET /dev-seo` — HTML con canonical y un script JSON-LD.
- [x] 5.2 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md` (página estática, sin API nueva).

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `pnpm run test:e2e` filtro gtk45 en verde.
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.
- [x] 6.3 Documentar: *E2E ejecutado — issue labels `Frontend` + `CHORE`*.

## 7. Security scan (fase 5b)

- [x] 7.1 `pnpm run security:scan`; informe `reports/security.md` (SAST sin DAST API; curl malicioso solo si aplica a página de prueba).

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 `frontend-standards.md` §6 si hace falta listar nuevos helpers explícitos.
- [x] 8.2 `api-spec.yml` / `data-model.md`: sin cambios de modelo (solo referencia enum `SchemaType`).

## 9. Code review (OBLIGATORIO)

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO` y sección seguridad (SEC-1–3).

## 10. Archive (tras Gate 2 humano)

- [x] Archivar change y sincronizar spec viva `seo-utilities`.
