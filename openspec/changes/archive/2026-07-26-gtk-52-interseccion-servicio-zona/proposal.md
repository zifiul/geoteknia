# Proposal — gtk-52-interseccion-servicio-zona

## Qué

Plantilla pública de intersección servicio+zona en `/servicios/[slug]/[zona]` para filas publicadas de `service_zone_pages`, con contenido editorial único (`body`, `targetKeyword`), JSON-LD `Service` + `BreadcrumbList`, enlaces cruzados al servicio pillar y geo-landing, y CTA con `servicio`+`provincia` preseleccionados.

## Por qué

Nodos de cluster prioritarios (PRD §8.3): captar keywords transaccionales servicio+territorio sin thin content ni canibalización entre silos.

## Alcance

- Lector `getPublishedServiceZonePageBySlugs()` y `listPublishedServiceZonePageStaticParams()` en `lib/content/service-zone-pages.ts`.
- Ruta `app/(public)/servicios/[slug]/[zona]/page.tsx` + `error.tsx`.
- Organismos Stitch en `components/organisms/intersection/`.
- Tests unitarios + E2E (canonical, JSON-LD, 404, no-canibalización).
- **No** tocar `lib/seo/canonical.ts` ni duplicar helpers SEO existentes.
- Sin Route Handlers nuevos (fase contrato omitida).

## Corrección de ruta

Patrón canónico ya en `lib/seo/silo-urls.ts`: `/servicios/{serviceSlug}/{zoneSlug}` — no slug con guion ni detección en `[slug]/page.tsx`.

## Linear

[GTK-52](https://linear.app/geoteknia/issue/GTK-52/paginas-de-interseccion-servicio-zona-nodos-de-cluster-prioritarios)

## Stitch

Proyecto `9787207935189076711`, design system `3480174961756698237`. Pantallas «Estudios geotécnicos» Madrid / Valencia / Sevilla (desktop + mobile), comentario Linear 2026-07-19. Referencia visual: hero primario, contexto geológico, cuerpo editorial, enlaces cruzados y CTA sticky.

## Reutilización

`buildMetadata` (`service_zone_page` + `siloExtra`), `buildServiceSchema`, breadcrumbs `service_zone_page`, `StickyCtaBar`, `buildPresupuestoHref` / `buildContactContextQuery`, ISR GTK-40.
