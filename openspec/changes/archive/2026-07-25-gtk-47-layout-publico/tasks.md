# Tasks — gtk-47-layout-publico

> US: GTK-47 — Layout público
> Label Linear: `Frontend` (E2E Playwright **sí**).
> Contrato API: **omitido** — sin Route Handlers ni Server Actions nuevos.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar Linear GTK-47, comentario Stitch y `docs/design/DESIGN.md`.
- [x] 0.2 Crear rama `feature/frontend-gtk-47-layout-publico`.
- [x] 0.3 Verificar rama actual y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 `tests/unit/content/organization.test.ts` — `getOrganizationProfile()` DTO y cache tag.
- [x] 1.2 `tests/unit/components/phone-link.test.tsx` — `tel:` válido.
- [x] 1.3 `tests/e2e/gtk47-layout-publico.spec.ts` — skip-link, menú, footer, breadcrumbs JSON-LD.
- [x] 1.4 Ejecutar Vitest/Playwright; evidencia RED en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación

- [x] 2.1 `lib/content/organization.ts` + `revalidateTag` en update de perfil.
- [x] 2.2 `PhoneLink`, `ContactTrackLink`, organismos layout (`SiteHeader`, `SiteNav`, `SiteFooter`, `SiteStickyContactBar`, `FooterCookiePreferences`).
- [x] 2.3 Actualizar `app/(public)/layout.tsx`; `app/(public)/not-found.tsx` (Stitch 404).
- [x] 2.4 Ampliar `dev-seo` con `Breadcrumbs` visibles.
- [x] 2.5 Exportaciones en `components/organisms/index.ts` si aplica.

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Ajustar E2E que dependan del layout (consent flotante, home).
- [x] 3.2 Suite completa en verde.

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build`.
- [x] 4.2 BD: lectura only — verificar sin escrituras de prueba o restaurar con `db-state-verify` si hubiera QA con escritura.
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas manuales con curl (OBLIGATORIO)

- [x] 5.1 Smoke `GET /`, `GET /dev-seo` (200, presencia de header/footer).
- [x] 5.2 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md` (sin API nueva).

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `pnpm run test:e2e` en verde.
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.
- [x] 6.3 *E2E ejecutado — issue label `Frontend`*.

## 7. Security scan (fase 5b)

- [x] 7.1 `reports/security.md`.

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 `frontend-standards.md` §8.3 si hace falta alinear ejemplos.
- [x] 8.2 Sin cambios `api-spec.yml` / `data-model.md` salvo revalidate tag documentado en design.

## 9. Code review (OBLIGATORIO)

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO`.

## 10. Archive (tras Gate 2 humano)

- [x] 10.1 Archivar change y sincronizar specs vivas.
