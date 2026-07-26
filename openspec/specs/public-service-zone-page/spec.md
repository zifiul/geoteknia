# public-service-zone-page

## Requirements

### Requirement: Ruta anidada de intersección publicada

The system SHALL expose `/servicios/{serviceSlug}/{zoneSlug}` as RSC with ISR (`revalidate = 3600`), static params only from published `service_zone_pages` rows, and `notFound()` when no published intersection exists for the pair.

#### Scenario: Intersección publicada
- **WHEN** a visitor requests `/servicios/{serviceSlug}/{zoneSlug}` for a published `service_zone_page`
- **THEN** the page renders intersection-specific `body` and metadata, cross-links to `/servicios/{serviceSlug}` and `/zonas/{zoneSlug}`, and budget CTAs with `servicio` and `provincia` query params

#### Scenario: Par servicio×zona sin fila CMS
- **WHEN** service and zone exist but no published `service_zone_page` links them
- **THEN** the response is HTTP 404 (no auto-generated page)

### Requirement: SEO y schema de intersección

The intersection page SHALL use `buildMetadata` with kind `service_zone_page` and `siloExtra` `{ serviceSlug, zoneSlug }`, emit JSON-LD `Service` via `buildServiceSchema()` and `BreadcrumbList` with kind `service_zone_page`.

#### Scenario: Canonical autoreferenciado
- **WHEN** the page renders
- **THEN** the document canonical equals `/servicios/{serviceSlug}/{zoneSlug}` on the site origin and differs from the service-only and geo-zone canonicals for the same slugs

### Requirement: Contenido único

The template SHALL render editorial fields from the `service_zone_page` row (`body`, `targetKeyword`, SEO block) and SHALL NOT concatenate the full service page body with the geo-landing body.

#### Scenario: Cuerpo editorial
- **WHEN** the intersection is published
- **THEN** only the intersection `body` is shown as the main editorial block

### Requirement: Analítica

The page SHALL emit `scroll_depth` with `serviceSlug` and `provinceSlug` when consent allows, and engagement `cta_click` via dataLayer per GTK-46 pattern.

#### Scenario: Scroll depth con contexto servicio+zona
- **WHEN** the visitor scrolls past thresholds with analytics consent
- **THEN** `scroll_depth` events include both `serviceSlug` and `provinceSlug` for the intersection URL
