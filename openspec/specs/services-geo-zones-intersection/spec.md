# services-geo-zones-intersection Specification

## Purpose

Núcleo del contenido publicable SEO: páginas pillar de servicios (`services`), geo-landings por provincia (`geo_zones`), intersección servicio×zona (`service_zone_pages`) y cobertura M:N (`service_zone_coverage`). Materializa GTK-18 y `docs/technical/data-model.md` §4.4. Base de silos SEO, linking interno y captación orgánica.

## Requirements

### Requirement: Tabla services

El schema SHALL incluir `Service` con bloques SEO, EDITORIAL y AUDIT; `slug` único; `workflow_status` default `borrador_ia`; índices en `workflow_status` y `deleted_at`.

#### Scenario: Default de workflow_status en servicio

- **WHEN** se crea un servicio sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

#### Scenario: Slug único de servicio

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `services.slug`

#### Scenario: Índice soft-delete en servicios

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `services.deleted_at`

### Requirement: Tabla geo_zones

El schema SHALL incluir `GeoZone` con FK `province_id` (restrict), bloques SEO/EDITORIAL/AUDIT e índices en `province_id` y `workflow_status`.

#### Scenario: FK a provincia con restrict

- **WHEN** se inspecciona la migración
- **THEN** `geo_zones.province_id` referencia `provinces.id` con `ON DELETE RESTRICT`

#### Scenario: Slug único de geo-zona

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `geo_zones.slug`

### Requirement: Tabla service_zone_pages

El schema SHALL incluir `ServiceZonePage` con bloques SEO/EDITORIAL/AUDIT, `slug` único e índice único compuesto `(service_id, zone_id)`.

#### Scenario: Una sola página por combinación servicio×zona

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `(service_zone_pages.service_id, service_zone_pages.zone_id)`

#### Scenario: Default editorial en intersección

- **WHEN** se crea una página servicio×zona sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

### Requirement: Tabla service_zone_coverage

El schema SHALL incluir `ServiceZoneCoverage` como tabla puente M:N con PK compuesta `(service_id, zone_id)` y cascade en FKs.

#### Scenario: PK compuesta de cobertura

- **WHEN** se inspecciona la migración
- **THEN** la clave primaria de `service_zone_coverage` es `(service_id, zone_id)`

### Requirement: Back-relation en Province

El modelo `Province` SHALL incluir la relación `geoZones GeoZone[]`.

#### Scenario: Relación provincia a geo-zonas

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Province` declara `geoZones GeoZone[]`

### Requirement: Back-relation blog en Service

El modelo `Service` SHALL incluir la relación `blogPostServices BlogPostService[]` para linking interno desde artículos.

#### Scenario: Relación servicio a links de blog

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Service` declara `blogPostServices BlogPostService[]`
