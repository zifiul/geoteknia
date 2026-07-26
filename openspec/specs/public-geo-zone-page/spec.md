# public-geo-zone-page Specification

Páginas públicas de cobertura geográfica `/zonas` y `/zonas/[slug]` (GTK-51). Materializa RF-04 con geología local, cobertura de servicios y enlaces a casos filtrados.

## Requirements

### Requirement: Rutas públicas de geo-landing

The system SHALL expose `/zonas` and `/zonas/[slug]` as RSC with ISR (`revalidate = 3600`), static params from published zones, and `notFound()` for unpublished or missing slugs.

#### Scenario: Zona publicada
- **WHEN** a visitor requests `/zonas/{slug}` for a published geo zone
- **THEN** the page renders hero, local geology, body, optional operational base, service coverage links, and budget CTA with `?provincia={zoneSlug}`

#### Scenario: Slug inexistente
- **WHEN** the slug is not published
- **THEN** the response is HTTP 404

### Requirement: SEO y schema

The geo-landing SHALL use `buildMetadata` with kind `geo_zone` and emit JSON-LD `BreadcrumbList` only (no duplicate `LocalBusiness` per zone).

#### Scenario: BreadcrumbList
- **WHEN** the page renders
- **THEN** a `BreadcrumbList` JSON-LD is present and no `LocalBusiness` JSON-LD is emitted on the page

### Requirement: Cobertura de servicios y casos

Service links SHALL prefer published `service_zone_page` URLs over generic `/servicios/[slug]`. Case studies SHALL link to `/proyectos?provincia={provinceSlug}` when cases exist; otherwise show contact guidance without a catalog link.

#### Scenario: Intersección publicada
- **WHEN** a service has a published intersection page for the zone
- **THEN** the coverage link targets `/servicios/{serviceSlug}/{zoneSlug}`

### Requirement: Sin aviso de thin content en público

The public template SHALL NOT display CMS word-count warnings to visitors.

#### Scenario: Visitante anónimo
- **WHEN** a geo zone has `word_count` below the editorial threshold
- **THEN** no warning about word count appears on the public page
