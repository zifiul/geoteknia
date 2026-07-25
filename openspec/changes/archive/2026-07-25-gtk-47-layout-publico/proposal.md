# Proposal — gtk-47-layout-publico

> US: [GTK-47 — Layout público: header sticky, navegación, footer y NAP](https://linear.app/geoteknia/issue/GTK-47/layout-publico-header-sticky-navegacion-footer-y-nap)
> Label Linear: `Frontend` (E2E Playwright **sí**).
> Diseño Stitch: proyecto `9787207935189076711`, design system `3480174961756698237`; pantallas layout shell `b81fcc99…`, drawer móvil `d283aa98…`, 404 desktop/mobile `e1e6e20d…` / `d0bad75d…`.

## Why

El frontal público solo tiene layout mínimo (GTM/consent de GTK-46) sin cabecera, pie ni NAP dinámico. Sin shell de navegación los silos (servicios, zonas, proyectos, blog, etc.) no son alcanzables con baja fricción y el NAP no puede alinearse con GBP desde `organization_profile`. GTK-48 y el resto de plantillas públicas dependen de este layout.

## What Changes

- Añadir `getOrganizationProfile()` (y lectura pública de canal de contacto general) cacheada en `lib/content/organization.ts`.
- Organismos `SiteHeader`, `SiteNav`, `SiteFooter` en `components/organisms/layout/` según Stitch y `docs/design/DESIGN.md`.
- Molécula `PhoneLink` y barra sticky reutilizando `StickyCtaBar` con CTAs de contacto y tracking vía `trackConversionEvent`.
- Actualizar `app/(public)/layout.tsx`: skip-link, `main` enfocable, header/footer; retirar botón flotante duplicado de cookies (enlace en footer con `openConsentPreferences`).
- Página `not-found` pública alineada con Stitch.
- Página dev de breadcrumbs para E2E (`dev-seo` ampliada o ruta dedicada) con `Breadcrumbs` + `JsonLd`.
- Tests unitarios + E2E `gtk47-layout-publico.spec.ts`.

## Capabilities

### New Capabilities

- `public-site-layout`: shell público (header sticky, navegación silos, footer NAP, skip-link, menú móvil accesible, integración consent/cookies y lectura pública de perfil organización).

### Modified Capabilities

- `public-front-scaffolding`: el layout del grupo `(public)` SHALL incluir header, `main` semántico y footer con NAP desde BD (no solo GTM/consent).

## Impact

- **Código:** `app/(public)/`, `components/organisms/layout/`, `components/molecules/PhoneLink.tsx`, `lib/content/organization.ts`, tests unit/E2E.
- **API / contrato:** sin Route Handlers ni Server Actions nuevos — fase 2 del harness omitida.
- **SEO:** `BreadcrumbList` en páginas que consuman el patrón documentado; layout sin metadata de contenido propia.
- **RGPD/PII:** NAP público (teléfono/email corporativos); sin PII de leads en layout; cookies vía trigger existente.
- **Rendimiento:** header sticky sin CLS; lectura cacheada del singleton.

## Fuera de alcance

- Segmentación WhatsApp/tel por departamento (GTK-67).
- Schema `LocalBusiness`/`Organization` en home (GTK-48/59).
- Redacción de páginas legales.
- Lighthouse CI gate estricto (GTK-77).
