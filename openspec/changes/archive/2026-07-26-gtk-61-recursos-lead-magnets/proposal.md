# Proposal — gtk-61-recursos-lead-magnets

> US: [GTK-61 — Recursos técnicos / lead magnets gated](https://linear.app/geoteknia/issue/GTK-61/recursos-tecnicos-lead-magnets-gated)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/recursos` desktop `cfe6b0180b0b4fb58d0c98c1540424d8`, mobile `5f2f8a66f55e42b7a6e34c2a9dff6329`; ficha gated (ej. checklist) desktop `f39e365603184c82b00147ce0927aad6`, mobile `eccce9ba48e246f69887cda4cd31498d`.
> Dependencias GTK-46, GTK-32, GTK-63, GTK-30, GTK-47 cerradas.

## Why

Captar leads de nurturing (RF-11 / US-10) con recursos técnicos descargables tras formulario breve, Thank You medible y descarga sin exponer URLs internas de almacenamiento. Cierra el hueco de `GET /api/recursos/download` que GTK-30 referencia pero no implementó.

## What Changes

- Lectores `listPublishedLeadMagnets()` y `getPublishedLeadMagnetBySlug()` en `lib/content/lead-magnets.ts` (`PUBLISHED_EDITORIAL_WHERE`, portada vía `og_image_id`).
- Rutas RSC `/recursos` y `/recursos/[slug]` (SSG + ISR); formulario Client `ResourceForm` contra `POST /api/recursos/[slug]` existente.
- `GET /api/recursos/download` — valida token `base64url(leadId:leadMagnetId)`, sirve PDF sin filtrar `file_url` en JSON.
- `ResourceCard`, breadcrumbs JSON-LD, metadata vía `buildMetadata()` (silo `lead_magnet`).
- Tracking: `form_start` en dataLayer; **no** duplicar `resource_download` (backend GTK-30).

## Decisiones de producto

- Recursos `is_gated: false` **fuera de alcance** (ticket de seguimiento): listado y ficha solo para publicados con `isGated: true`.
- Token de descarga MVP: reutilizable (sin invalidación tras primer uso); riesgo documentado en `design.md`.

## Capabilities

### New

- `public-resource-pages`: catálogo y ficha gated + endpoint de descarga protegida.

### Modified

- `docs/technical/api-spec.yml`: documentar `GET /api/recursos/download`.
- `lib/seo/silo-urls.ts` + `sitemap-config`: kind `lead_magnet` → `/recursos/[slug]`.

## Impact

- **Contrato:** evolución de `api-spec.yml` (GET download); `resourceLeadSchema` sin cambios.
- **QA:** E2E Playwright obligatorio (label `Frontend`).

## Fuera de alcance

- Ficha/descarga directa para `is_gated: false`; invalidación real one-time token; auditoría WCAG formal (GTK-76/77).
