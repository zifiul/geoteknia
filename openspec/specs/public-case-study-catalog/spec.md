# public-case-study-catalog Specification

## Purpose

Catálogo público `/proyectos` de casos de estudio publicados: filtros en URL, paginación SEO-friendly, integración con utilidades GTK-78 y UI mobile-first. Materializado con GTK-50.

## Requirements

### Requirement: Catálogo publicado filtrable

The system SHALL expose `/proyectos` listing published case studies with server-side filters `servicio`, `tipologia`, `provincia`, `ano` and pagination `page`, using `PUBLISHED_EDITORIAL_WHERE`.

#### Scenario: Filtros válidos

- **WHEN** the user navigates with recognized filter slugs
- **THEN** results are restricted accordingly and the URL reflects active filters

#### Scenario: Filtros inválidos

- **WHEN** the URL contains unknown slugs or invalid year
- **THEN** those parameters are ignored without error responses

### Requirement: SEO de listado GTK-78

The catalog SHALL use `buildListingCanonical`, `resolveListingRobots`, `analyzeListingSearchParams`, `buildPaginationNavLinks`, and `<PaginationLinks />` without duplicating SEO logic.

#### Scenario: Sin filtros

- **WHEN** `/proyectos` or `/proyectos?page=N` without filters
- **THEN** robots allow index and canonical is self-referential per page

#### Scenario: Con filtros

- **WHEN** any catalog filter param is active
- **THEN** robots are `noindex,follow` and canonical points to clean `/proyectos`

### Requirement: Accesibilidad y vacío

The UI SHALL provide labeled filters, `aria-live` result count, keyboard-operable controls, and an empty state with reset and contact CTA.

#### Scenario: Sin resultados con filtros

- **WHEN** no case matches active filters
- **THEN** empty state offers clear filters link
