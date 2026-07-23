# Informe — GTK-14 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-14-conversion-events`  
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
| `npx prisma migrate dev --name conversion_events` | ✅ Migración `20260723062725_conversion_events` creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con `ConversionEvent` |

## Criterios de aceptación GTK-14

| Criterio | Estado |
|----------|--------|
| Enum `ConversionEventName` con 8 valores | ✅ |
| Tabla `conversion_events` append-only (sin `updated_at`/`deleted_at`) | ✅ |
| FK `conversion_events.lead_id` → `leads` ON DELETE SET NULL | ✅ |
| Índice compuesto `(service_slug, province_slug)` | ✅ |
| Índices `event_name`, `occurred_at`, `lead_id` | ✅ |
| Back-relation `conversionEvents` en `Lead` | ✅ |
| Reutiliza `LeadType` y `LeadSource` (GTK-12) | ✅ |
| Sin seed (población en runtime) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE enum + CREATE table + indexes + FK); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
