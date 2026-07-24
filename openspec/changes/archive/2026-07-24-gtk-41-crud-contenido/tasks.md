# Tasks — gtk-41-crud-contenido

> US: [GTK-41](https://linear.app/geoteknia/issue/GTK-41/crud-de-contenido-publicable-y-maestros-servicios-zonas-casos-blog)
> Rama: `feature/backend-gtk-41-crud-contenido`
> Label `Backend`: fase 5a **omite E2E Playwright** (N+3). E2E integrado: US frontend futura.

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-41-crud-contenido` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-41-crud-contenido` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobado 2026-07-24 (proposal + specs + design + threat model).

## 1. Contrato (fase 2)

- [x] 1.1 Congelar schemas Zod en `lib/content/schemas/**` y por entidad en `lib/content/*-schemas.ts` (sin Route Handlers).
- [x] 1.2 Registrar omisión o nota en `api-spec.yml` (Server Actions internas) en `reports/2026-07-24-phase-2-contract.md`.

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests fundamentos: `tests/unit/content/slug.test.ts`, `seo-schema.test.ts`, `editorial-schema.test.ts`.
- [ ] 2.2 Tests abuse SEC-1..SEC-6 + RBAC (`tecnico`, config admin-only).
- [ ] 2.3 Tests por ola 41b (services, geo-zones, service_zone_pages, coverage M:N).
- [ ] 2.4 Tests por ola 41c (case_studies, team, machinery, accreditations).
- [ ] 2.5 Tests por ola 41d (blog, faqs).
- [ ] 2.6 Tests por ola 41e (lead_magnets, media, calculator_rules, organization, contact_channels).
- [x] 2.7 Ejecutar Vitest y evidencia RED en `reports/2026-07-24-step-3-tdd-red.md`.

## 3. Implementación — ola 41a (fase 4a)

- [x] 3.1 Migración `AuditAction.content_update` + `lib/audit/*`.
- [x] 3.2 `lib/content/slug.ts`, `errors.ts`, `schemas/seo.ts`, `schemas/editorial.ts`, `content-action-result.ts`, `require-admin.ts`.
- [x] 3.3 `lib/env.ts` — `MEDIA_STORAGE_BASE_URL`.
- [x] 3.4 Tests fundamentos (2.1) en VERDE.

## 4. Implementación — ola 41b (SEO core)

- [x] 4.1 `lib/content/services.ts`, `geo-zones.ts`, `service-zone-pages.ts`, `service-zone-coverage.ts`.
- [x] 4.2 `app/(admin)/contenido/**` Server Actions servicios/geo/intersección.
- [ ] 4.3 Tests 2.3 en VERDE.

## 5. Implementación — ola 41c (E-E-A-T)

- [x] 5.1 Módulos case studies, team, machinery, accreditations + actions.
- [ ] 5.2 Tests 2.4 en VERDE.

## 6. Implementación — ola 41d (blog/FAQ)

- [x] 6.1 Módulos blog + faqs + actions.
- [ ] 6.2 Tests 2.5 en VERDE.

## 7. Implementación — ola 41e (conversión/config)

- [x] 7.1 lead magnets, media, calculator rules, organization, contact channels + actions.
- [ ] 7.2 Tests 2.6 en VERDE.

## 8. Implementación frontend (fase 4b)

- [x] 8.1 **Omitida** — sin UI en este ticket (Backend).

## 9. Revisar tests existentes (OBLIGATORIO)

- [x] 9.1 Revisar suites `audit`, `auth/rbac`, `env`, `crypto`; sin regresiones (255 tests).

## 10. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 10.1 Baseline/diff BD (`db-state-verify`); migración `content_update` aplicada; conteos en informe.
- [x] 10.2 Ejecutar Vitest dirigido + suite unitaria razonable (`npm run test`).
- [x] 10.3 Informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 11. Pruebas manuales con curl (N+2)

- [x] 11.1 **Omitido** — sin Route Handlers nuevos (solo Server Actions).

## 12. E2E Playwright (N+3)

- [x] 12.1 **Omitido — issue label `Backend`**.

## 13. Security scan (fase 5b)

- [x] 13.1 Skill `security-scan`; informe `reports/security.md`.

## 14. Code review (fase 6)

- [x] 14.1 Informe `reports/code-review.md` con línea `Veredicto: APTO` o `NO APTO`.

## 15. Docs (fase 7)

- [x] 15.1 Actualizar `data-model.md` / `backend-standards.md` (patrón CRUD + schemas SEO/EDITORIAL).
- [x] 15.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 16. Archive (fase 8 — tras Gate 2 humano)

- [x] 16.1 Gate `require-code-review` (APTO en `reports/code-review.md`).
- [x] 16.2 Archive + sync specs vivas (`admin-content-crud`). Gate 2: `reports/2026-07-24-gate-2.md`.
- [ ] 16.3 Commit y PR: **manual (humano)**.
