# Proposal — gtk-49-plantilla-servicio

> US: [GTK-49 — Plantilla de página de servicio](https://linear.app/geoteknia/issue/GTK-49/plantilla-de-pagina-de-servicio-silo-isr-schema-service)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237`, `/servicios/estudios-geotecnicos` desktop `00bae38182ca40f29e92d0d8d3645d92`, mobile `f9569764d09745a898e898d2a039f366`.
> Dependencias cerradas: GTK-40, GTK-41, GTK-45, GTK-46, GTK-47, GTK-48. GTK-66 (presupuesto) pendiente — CTA con query `?servicio=` sin destino funcional hasta entonces.

## Why

Materializar el silo de servicios (RF-01, US-02): landing orgánica/SEM P1 con contenido CMS, JSON-LD `Service` extendido, enlaces internos a casos y geo-landings publicadas, e ISR on-demand ya soportado por GTK-40.

## What Changes

- Rutas `app/(public)/servicios/page.tsx` e `app/(public)/servicios/[slug]/page.tsx` (SSG + `revalidate`).
- Lecturas públicas en `lib/content/*` y extensión `buildServiceSchema()`.
- Organismos `components/organisms/service/*` y `BudgetCta` según Stitch/DESIGN.md.
- Tracking: `scroll_depth`, `click_whatsapp`/`click_tel` con `serviceSlug`; CTA presupuesto vía dataLayer (no conversión).

## Capabilities

### New

- `public-service-page`: plantilla servicio, índice `/servicios`, JSON-LD Service + FAQPage opcional.

### Modified

- `seo-utilities`: `buildServiceSchema` con `serviceType`, `provider`, `areaServed`.

## Impact

- **Contrato API:** omitido (sin Route Handlers nuevos).
- **QA:** E2E Playwright obligatorio (label `Frontend`).
