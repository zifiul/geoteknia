# Proposal — gtk-18-services-geo-zones-intersection

> US: [GTK-18 — Servicios, geo-zonas, páginas de intersección y cobertura](https://linear.app/geoteknia/issue/GTK-18/servicios-geo-zonas-paginas-de-interseccion-y-cobertura)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9, GTK-10, GTK-16 | Desbloquea: GTK-13, GTK-15, GTK-20

## Why

El núcleo del contenido publicable SEO (`services`, `geo_zones`, `service_zone_pages`, `service_zone_coverage`) articula los silos SEO y el patrón servicio×zona, base de la captación orgánica. Materializa RF-01, RF-04, RF-Q1/§8.3 y §8.2, entidades 3, 4, 5 y 21 del modelo.

## What Changes

- Crear modelo `Service` con bloques SEO, EDITORIAL y AUDIT.
- Crear modelo `GeoZone` con FK a `Province` y bloques SEO, EDITORIAL y AUDIT.
- Crear modelo `ServiceZonePage` con unique compuesto `(service_id, zone_id)` y bloques SEO, EDITORIAL y AUDIT.
- Crear tabla puente `ServiceZoneCoverage` (M:N).
- Añadir back-relation `geoZones` en `Province`.
- Migración `services_geo_zones_intersection` (DDL-only, sin data migration).

## Capabilities

### New Capabilities

- `services-geo-zones-intersection`: contenido SEO pillar, geo-landings, intersección servicio×zona y cobertura M:N.

### Modified Capabilities

- `master-provinces-work-typologies`: back-relation `geoZones` en `Province`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** cuatro tablas en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII; contenido editorial técnico generable asistido por IA (RNF-IA).
- **Tickets desbloqueados:** GTK-13, GTK-15, GTK-20.

## Fuera de alcance

- Seed de catálogo de servicios (DB-14).
- Relaciones salientes hacia `case_studies`, `faq_groups`, etc. (tickets DB posteriores).
- Lógica de dominio en `/lib/`.
- Índices parciales en `workflow_status = 'publicado'` (DB-15).
