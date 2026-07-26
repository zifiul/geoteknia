# Proposal — gtk-63-thank-you-pages

> US: [GTK-63 — Thank You pages de URL única (noindex) por tipo de conversión](https://linear.app/geoteknia/issue/GTK-63/thank-you-pages-de-url-unica-noindex-por-tipo-de-conversion)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` (comentario Linear 2026-07-19): pantallas desktop/mobile para `/gracias/presupuesto`, `/gracias/licitacion`, `/gracias/ubicacion`, `/gracias/recurso`.
> Dependencias: GTK-47, GTK-46 (Done). Reutiliza `THANK_YOU_PAGE_ROBOTS` (GTK-78), copy de confirmación (GTK-27).

## Why

Las Thank You de URL única confirman la recepción del lead, muestran referencia y plazo de respuesta, ofrecen siguientes pasos y permanecen `noindex` para medir conversiones en cliente (GA4/Ads) sin indexar URLs transaccionales (US-12, RF-11, RNF-SEO).

## What Changes

- Cuatro rutas RSC `app/(public)/gracias/{presupuesto|licitacion|ubicacion|recurso}/page.tsx` con `generateMetadata` y `THANK_YOU_PAGE_ROBOTS`.
- Organismo común `ThankYouConfirmation` + Client Component `ThankYouConversionPing` (dataLayer una vez por `ref` vía `sessionStorage`).
- `app/robots.ts`: `disallow` de `/gracias`.
- Copy técnico/plazo desde `resolveTechnicianDisplayName()` / `RESPONSE_DEADLINE_COPY` (sin duplicar).
- Tests Vitest del organismo + E2E Playwright (label `Frontend` — E2E obligatorio).

## Capabilities

### New Capabilities

- `public-thank-you-pages`: plantillas Thank You por tipo de conversión, SEO noindex y ping de conversión cliente.

### Modified Capabilities

- `seo-utilities`: integración Fase 2 de `THANK_YOU_PAGE_ROBOTS` en páginas reales `/gracias/*`.

## Impact

- **API / contrato:** sin Route Handlers nuevos — **fase 2 omitida**.
- **Riesgo negocio:** copy de fallback de técnico sigue `[PENDIENTE]` (GTK-27); coherente email + Thank You hasta validación de negocio.
- **Secuenciación:** `/api/recursos/download` (GTK-61) puede no existir aún; Thank You solo enlaza `?download=` recibido.
- **QA:** E2E obligatorio; sin curl (sin API nueva).

## Fuera de alcance

Formularios origen (GTK-65/66/61/58), asignación real de técnico (CRM), implementación download API (GTK-61).
