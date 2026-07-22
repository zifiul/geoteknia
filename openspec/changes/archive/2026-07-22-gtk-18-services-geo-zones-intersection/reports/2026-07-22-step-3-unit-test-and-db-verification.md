# Informe — GTK-18 — tests unitarios y verificación BD

**Fecha:** 2026-07-22  
**Change:** `gtk-18-services-geo-zones-intersection`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 6/6 tests (env + db) |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma migrate dev --name services_geo_zones_intersection` | ✅ Migración creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con `Service`, `GeoZone`, `ServiceZonePage`, `ServiceZoneCoverage` |

## Criterios de aceptación GTK-18

| Criterio | Estado |
|----------|--------|
| `services.slug` único | ✅ |
| `geo_zones.slug` único | ✅ |
| `service_zone_pages.slug` único | ✅ |
| Unique compuesto `(service_id, zone_id)` | ✅ |
| PK compuesta `service_zone_coverage(service_id, zone_id)` | ✅ |
| `workflow_status` default `borrador_ia` en 3 entidades | ✅ |
| Bloques SEO, EDITORIAL y AUDIT completos | ✅ |
| Índice `services.deleted_at` | ✅ |
| Índice `geo_zones.province_id` | ✅ |
| FK `geo_zones.province_id` ON DELETE RESTRICT | ✅ |
| Back-relation `Province.geoZones` | ✅ |
| Sin seed (delegado a DB-14) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
