# Design — gtk-51-geo-landing-zona

## UI (Stitch)

Mobile-first alineado con geo-landings Madrid/Valencia/Sevilla (Stitch 2026-07-19): hero con imagen LCP (`priority`), breadcrumbs, bloque geología local, cuerpo editorial, base operativa, grid/lista de servicios en la zona, CTA presupuesto con provincia, enlace a casos y referencia NAP vía `/contacto`. Tokens `brand-*`, `font-display`, secciones alternas `bg-brand-surface` / `bg-brand-neutral/50` como GTK-49.

## Datos

- `getPublishedGeoZoneBySlug(slug)` — detalle publicado + provincia + hero resuelto.
- `listServiceCoverageByZone(zoneId, zoneSlug)` — cobertura M:N vía `service_zone_coverage`; href preferente a `service_zone_page` publicada, si no `/servicios/[slug]`.
- Casos: enlace `/proyectos?provincia={province.slug}`; bloque visible si `countPublishedCaseStudiesForProvince` > 0.
- Sin aviso `word_count` en público (solo CMS GTK-73).

## SEO

- `BreadcrumbList` únicamente; **no** emitir `LocalBusiness` por zona — enlace interno a Home/`/contacto` para entidad canónica (decisión documentada en GTK-51).

## Threat model

| Superficie | Riesgo | Mitigación |
|---|---|---|
| RSC `/zonas/[slug]` | Enumeración de borradores | `PUBLISHED_EDITORIAL_WHERE`; `notFound()` |
| Body CMS | XSS | Texto con `whitespace-pre-line`; sin `dangerouslySetInnerHTML` |
| CTAs | PII en URL | Solo slugs públicos (`provincia`, `servicio`) |
| Analytics | PII en eventos | `provinceSlug` canónico en `scroll_depth` / contacto |
| ISR | Contenido obsoleto | `resolveRevalidationPaths('geo_zone')` — test de regresión en unit |
