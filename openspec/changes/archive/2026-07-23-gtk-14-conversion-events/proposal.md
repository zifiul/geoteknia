# Proposal — gtk-14-conversion-events

> US: [GTK-14 — Eventos de conversión y tracking](https://linear.app/geoteknia/issue/GTK-14/eventos-de-conversion-y-tracking)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-12 | Desbloquea: GTK-32

## Why

La capa de medición interna necesita un registro append-only que espeje los eventos GTM/GA4 (`generate_lead`, microconversiones, calculadora, scroll depth) para atribución y reporting CPL por servicio×zona sin depender de exportaciones GA4. Materializa RF-10 (tracking), RNF-DATA y la entidad 40 del modelo.

## What Changes

- Crear enum `ConversionEventName` con los 8 tipos de evento documentados.
- Crear modelo `ConversionEvent` append-only (sin `updated_at`/`deleted_at`).
- FK opcional `lead_id` → `leads` con `onDelete: SetNull`.
- Reutilizar enums `LeadType` y `LeadSource` (GTK-12).
- Back-relation `conversionEvents` en `Lead`.
- Migración `conversion_events` (DDL-only, sin data migration ni seed).
- Índices: `event_name`, `occurred_at`, `lead_id`, compuesto `(service_slug, province_slug)`.

## Capabilities

### New Capabilities

- `conversion-events`: registro append-only de eventos de medición y atribución interna.

### Modified Capabilities

- `crm-contacts-leads-projects-pipeline`: back-relation `conversionEvents` en `Lead`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** 1 enum + 1 tabla en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas; ingesta en GTK-32).
- **RGPD:** identificadores de seguimiento (`ga_client_id`, `session_id`); base legal consentimiento cookies analíticas.
- **Tickets desbloqueados:** GTK-32 (POST /api/eventos).

## Fuera de alcance

- Endpoint de ingesta (GTK-32).
- Índice BRIN / particionado temporal (GTK-19 / DB-15).
- Lógica de dominio en `/lib/`.
