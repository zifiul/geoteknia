# Code Review — GTK-14 Eventos de conversión y tracking

**Fecha:** 2026-07-23  
**Change:** `gtk-14-conversion-events`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — enum `ConversionEventName`, modelo `ConversionEvent`, back-relation en `Lead`
- `prisma/migrations/20260723062725_conversion_events/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PK | ✅ |
| Modelo alineado con `data-model.md` §4.11 | ✅ |
| Append-only (sin `updated_at`/`deleted_at`) | ✅ |
| FK `lead_id` nullable ON DELETE SET NULL | ✅ |
| Índice compuesto `(service_slug, province_slug)` | ✅ |
| Índices `event_name`, `occurred_at`, `lead_id` | ✅ |
| Reutiliza enums `LeadType`, `LeadSource` | ✅ |
| Back-relation `conversionEvents` en `Lead` | ✅ |
| Sin seed (runtime) | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.

Veredicto: APTO
