# TDD-RED — gtk-42-sitemap-robots

- Fecha: 2026-07-24
- Suites: `tests/unit/seo/silo-urls.test.ts`, `sitemap-sources.test.ts`, `sitemap-routes.test.ts`; actualizado `tests/unit/security/robots.test.ts`, `tests/unit/env.test.ts`.

## Evidencia

Tests escritos antes de implementación completa; verificación final: `npm test` — **302 passed** (incl. 11 tests GTK-42).

## Contrato de implementación

- `lib/seo/silo-urls.ts`, `sitemap-config.ts`, `sitemap-sources.ts`, `build-image-sitemap-xml.ts`
- `app/sitemap.ts`, `app/sitemap-imagenes/route.ts`, `app/robots.ts`
- `NEXT_PUBLIC_SITE_URL` en `lib/env.ts`

## E2E

- **Omitido** — label `Backend`; integración vía tests unitarios de XML y mocks Prisma.
