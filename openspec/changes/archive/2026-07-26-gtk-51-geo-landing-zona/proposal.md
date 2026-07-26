# Proposal — gtk-51-geo-landing-zona

## Qué

Plantilla pública `/zonas` (índice) y `/zonas/[slug]` (geo-landing por provincia) con geología local, cuerpo editorial, base operativa, cobertura de servicios (preferencia `service_zone_page` publicada) y enlaces a casos filtrados y presupuesto con provincia preseleccionada.

## Por qué

Materializa RF-04 / US-08: captar intención local (servicio+provincia) y proximidad territorial sin thin content ni JSON-LD `LocalBusiness` duplicado por zona.

## Alcance

- Lectores `getPublishedGeoZoneBySlug` y `listServiceCoverageByZone` en `lib/content/geo-zones.ts`.
- Organismos Stitch en `components/organisms/geo/`.
- Tests unitarios + E2E Playwright.
- Sin Route Handlers nuevos (fase contrato omitida).

## Linear

[GTK-51](https://linear.app/geoteknia/issue/GTK-51/plantilla-de-geo-landing-por-zona-isr-geologia-local)

## Stitch

Proyecto `9787207935189076711`, design system `3480174961756698237`. Referencia visual: geo-landings Madrid/Valencia/Sevilla (desktop + mobile) del comentario Linear 2026-07-19.

## Reutilización

`buildMetadata`, breadcrumbs `geo_zone`, `listPublishedGeoZones`, `buildCaseCatalogWhere`, `StickyCtaBar` / barra layout, `buildPresupuestoHref`, ISR GTK-40.
