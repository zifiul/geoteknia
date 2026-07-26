# Proposal — gtk-59-acreditaciones

> US: [GTK-59 — Acreditaciones y certificaciones (schema Organization/hasCredential)](https://linear.app/geoteknia/issue/GTK-59/acreditaciones-y-certificaciones-schema-organizationhascredential)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/acreditaciones` desktop `d0390e2a59a24231a6283b34f075d56c`, mobile `43b0bf9ac27e483b8d9b66b48e383af7`.

## Why

Demostrar solvencia técnica (P3/licitaciones) y diferenciación ENAC requiere una página pública de credenciales verificables con JSON-LD `Organization`/`hasCredential` (RF-12, US-09).

## What Changes

- Ruta RSC `app/(public)/acreditaciones/page.tsx` (SSG + ISR `revalidate = 3600`), metadata estática, canonical `/acreditaciones`.
- Lector `listPublishedAccreditationsDetailed()` en `lib/content/accreditations.ts` (sin modificar `listActiveAccreditations()` de la Home).
- Organismos `CredentialCard`, `CredentialGrid`; config `lib/accreditations/page-config.ts`.
- JSON-LD `Organization` vía `buildOrganizationSchema()` + `getOrganizationProfile()` y `BreadcrumbList` manual.
- Enlace a `/licitaciones`; `select_content` en verificación y CTA obra pública (dataLayer).
- Tests Vitest del lector + regresión Home; E2E Playwright.

## Capabilities

### New Capabilities

- `public-accreditations-page`: página `/acreditaciones` con credenciales publicadas, SEO y analítica.

### Modified Capabilities

- Ninguna.

## Impact

- **Contrato API:** omitido (solo lectura pública).
- **Datos:** reutiliza `accreditations` + `media_assets` (CRUD GTK-41); alta de filas reales es tarea de contenido.
- **GTK-58:** clasificación de contratista aquí es credencial (`credential_type: clasificacion_contratista`), no tabla `contractor_classifications`.

## Fuera de alcance

- Tabla detallada CPV (`contractor_classifications`) — GTK-58.
- Lighthouse CI formal (GTK-77).
