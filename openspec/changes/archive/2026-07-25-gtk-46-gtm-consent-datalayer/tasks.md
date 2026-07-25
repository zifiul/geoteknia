# Tasks — gtk-46-gtm-consent-datalayer

> US: GTK-46 — GTM, Consent Mode v2, banner RGPD y capa dataLayer
> Labels Linear: `Frontend`, `CHORE` (E2E Playwright **sí**; no es label `Backend`).
> Contrato API: **omitido** — sin Route Handlers nuevos; cliente consume `POST /api/eventos` (GTK-32).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/frontend-standards.md` §11, Linear GTK-46 y `lib/analytics/` existente.
- [x] 0.2 Crear rama `feature/frontend-gtk-46-gtm-consent-datalayer` desde `main`.
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se pisa trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro)

- [x] 1.1 Tests `tests/unit/analytics/consent.test.ts` (transiciones denied→granted, persistencia, SEC asociados).
- [x] 1.2 Tests `tests/unit/analytics/datalayer.test.ts` (payload, consentimiento, `sanitizePageUrl`, SEC-1/3).
- [x] 1.3 Tests `tests/unit/analytics/track.test.ts` (mapeo `conversionEventSchema`, mock `fetch`, SEC-2/4).
- [x] 1.4 Abuse cases: payload con claves extra → no enviado; sin consentimiento → sin fetch (SEC-1).
- [x] 1.5 E2E `tests/e2e/gtk46-consent-datalayer.spec.ts` (red, dataLayer, teclado, mirror API, SEC-5).
- [x] 1.6 Ejecutar Vitest y Playwright; evidencia RED en `reports/2026-07-25-step-3-tdd-red.md`.

## 2. Implementación (4a lib + 4b frontend)

- [x] 2.1 `lib/analytics/consent.ts` (Consent Mode v2, persistencia, helpers `hasAnalyticsConsent`).
- [x] 2.2 `lib/analytics/attribution.ts` (utm/gclid → dataLayer técnico).
- [x] 2.3 `lib/analytics/datalayer.ts` (`pushDataLayer`).
- [x] 2.4 `lib/analytics/track.ts` (mirror `/api/eventos`).
- [x] 2.5 Actualizar `lib/analytics/index.ts` (exports públicos sin romper server-only).
- [x] 2.6 `components/analytics/gtm.tsx`.
- [x] 2.7 `components/analytics/consent-banner.tsx` + export `openConsentPreferences`.
- [x] 2.8 `app/(public)/layout.tsx` — montaje GTM + banner + trigger flotante mínimo.
- [x] 2.9 `app/(public)/dev-analytics/page.tsx` (noindex, botón prueba E2E).
- [x] 2.10 `.env.example` — `NEXT_PUBLIC_GTM_ID`.

## 3. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 3.1 Confirmar suites `tests/unit/analytics/*` (GTK-32) y E2E GTK-43/44/45 en verde.
- [x] 3.2 Ajustar solo si layout público o imports globales afectan smoke existente.

## 4. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 4.1 `pnpm run test`, `typecheck`, `lint`, `build` en verde.
- [x] 4.2 BD: **NO APLICABLE** salvo regresión indirecta en QA GTK-32 (solo lectura); documentar en informe.
- [x] 4.3 Informe `reports/2026-07-25-step-N+1-unit-test-and-db-verification.md`.

## 5. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Smoke `POST /api/eventos` con payload válido (contrato existente) — verificar 202 tras implementación de `track` (referencia).
- [x] 5.2 Smoke `GET /dev-analytics` — HTML monta scripts/banner.
- [x] 5.3 Informe `reports/2026-07-25-step-N+2-curl-endpoint-verification.md`.

## 6. E2E Playwright (OBLIGATORIO — label Frontend)

- [x] 6.1 `pnpm run test:e2e` filtro gtk46 en verde.
- [x] 6.2 Informe `reports/2026-07-25-step-N+3-playwright-e2e-verification.md`.
- [x] 6.3 Documentar: *E2E ejecutado — issue labels `Frontend` + `CHORE`*.

## 7. Security scan (fase 5b)

- [x] 7.1 `pnpm run security:scan`; informe `reports/security.md` (SAST + SCA + secrets; DAST ligero sobre `/api/eventos` si aplica al mirror).

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 `frontend-standards.md` §11.3 si hace falta alinear `sourcePage` vs `pageUrl` con implementación real.
- [x] 8.2 `api-spec.yml`: sin cambio de contrato; referencia cruzada solo si procede.

## 9. Code review (OBLIGATORIO)

- [x] 9.1 `reports/code-review.md` con `Veredicto: APTO` y sección seguridad (SEC-1–5).

## 10. Archive (tras Gate 2 humano)

- [x] Archivar change y sincronizar spec viva `public-analytics-consent`.
