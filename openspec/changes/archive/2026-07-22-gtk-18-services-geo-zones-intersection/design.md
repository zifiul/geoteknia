# Design — gtk-18-services-geo-zones-intersection

> Variante Harness DB — `services`, `geo_zones`, `service_zone_pages`, `service_zone_coverage` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`Service`:** páginas pillar con bloques SEO/EDITORIAL/AUDIT; `workflow_status` default `borrador_ia`; índices en `workflow_status` y `deleted_at`.
2. **`GeoZone`:** geo-landing por provincia; FK `province_id` con `onDelete: Restrict`; índices en `province_id` y `workflow_status`.
3. **`ServiceZonePage`:** intersección servicio×zona; `@@unique([serviceId, zoneId])` evita canibalización SEO; cascade en FKs.
4. **`ServiceZoneCoverage`:** tabla puente M:N sin bloques SEO/EDITORIAL; PK compuesta `(service_id, zone_id)`.
5. **`Province.geoZones`:** back-relation introducida en este ticket.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `onDelete: Restrict` en `geo_zones.province_id` | Cascade | Proteger integridad de catálogo de provincias |
| `onDelete: Cascade` en intersección y cobertura | Restrict | Al borrar servicio/zona, limpiar páginas y cobertura |
| `workflow_status` default `borrador_ia` | `borrador` | Convención editorial GTK-6/GTK-16 |
| Sin FK a `users` en bloque EDITORIAL | FK dura | Patrón AUDIT del proyecto (GTK-6/7) |
| Sin seed | Seed inline | Catálogo de servicios en DB-14 |

## Migración

- Nombre: `services_geo_zones_intersection`
- DDL: 4 tablas, 3 unique indexes (slug), 1 unique compuesto `(service_id, zone_id)`, PK compuesta en cobertura
- Índices: `workflow_status`, `services.deleted_at`, `geo_zones.province_id`
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — contenido editorial público |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | `body`/`local_geology` generables asistidos; inputs técnicos sin PII (RNF-IA) |
| Canibalización SEO | Unique `(service_id, zone_id)` en `service_zone_pages` |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
