# Code Review — GTK-18 Servicios, geo-zonas, páginas de intersección y cobertura

**Fecha:** 2026-07-22  
**Change:** `gtk-18-services-geo-zones-intersection`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — modelos `Service`, `GeoZone`, `ServiceZonePage`, `ServiceZoneCoverage` y back-relation `Province.geoZones`
- `prisma/migrations/20260722183230_services_geo_zones_intersection/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PKs | ✅ |
| Modelos alineados con `data-model.md` §4.4 | ✅ |
| Bloques SEO, EDITORIAL y AUDIT en entidades de contenido | ✅ |
| `workflow_status` default `borrador_ia` | ✅ |
| Slugs únicos en `services`, `geo_zones`, `service_zone_pages` | ✅ |
| Unique compuesto `(service_id, zone_id)` anti-canibalización | ✅ |
| Índice `services.deleted_at` | ✅ |
| Índice `geo_zones.province_id` | ✅ |
| FK `province_id` con ON DELETE RESTRICT | ✅ |
| Cascade en intersección y cobertura | ✅ |
| Sin seed en este ticket (DB-14) | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.

Veredicto: APTO
