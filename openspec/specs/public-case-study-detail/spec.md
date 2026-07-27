# Delta spec — public-case-study-detail

## ADDED Requirements

### Requirement: Public case study detail route

The system SHALL serve `/proyectos/{slug}` for each published case study with SSG/ISR and return 404 when the slug is missing or unpublished.

#### Scenario: Published case

- **WHEN** a visitor requests a published case slug
- **THEN** the response is 200 with a single `h1`, editorial sections, and optional gallery

#### Scenario: Unknown slug

- **WHEN** the slug does not match a published case
- **THEN** the response is 404

### Requirement: Case JSON-LD and metadata

The detail page SHALL emit JSON-LD `Article` or `CreativeWork` (per `schemaType`), optional `contentLocation` when coordinates exist, multiple `author` persons linked to team profiles, and `BreadcrumbList`; metadata via `buildMetadata()` for `case_study`.

#### Scenario: Rich results fields

- **WHEN** the case is published with coordinates and team signers
- **THEN** the HTML contains primary JSON-LD with `contentLocation` and author persons with urls

### Requirement: Gallery reader

The system SHALL provide `listContentMediaGallery(contentType, contentId)` returning ordered `{ url, alt, order }` joined with non-deleted `media_assets`.

#### Scenario: Ordered gallery

- **WHEN** content media links exist for a published owner
- **THEN** the reader returns items sorted by `order` excluding deleted assets

### Requirement: Contextual budget CTA

The budget CTA SHALL link to `/presupuesto?servicio={serviceSlug}&provincia={provinceSlug}` for the case context.

#### Scenario: CTA query params

- **WHEN** the visitor activates the budget CTA on a case detail page
- **THEN** the link target includes both `servicio` and `provincia` query parameters

### Requirement: Client visibility

The page SHALL display `clientName` only when `clientIsPublic` is true.

#### Scenario: Private client

- **WHEN** `clientIsPublic` is false
- **THEN** the rendered page does not show the client name
