# conversion-events — Delta Spec

## ADDED Requirements

### Requirement: Enum ConversionEventName

El schema SHALL declarar el enum `ConversionEventName` con los valores: `generate_lead`, `click_tel`, `click_whatsapp`, `click_email`, `send_location`, `calculator_use`, `resource_download`, `scroll_depth`.

#### Scenario: Tipo de evento válido

- **WHEN** se crea un registro `conversion_events` con `event_name='generate_lead'`
- **THEN** Prisma valida el valor contra el enum `ConversionEventName`

### Requirement: Tabla conversion_events append-only

El schema SHALL incluir `ConversionEvent` sin columnas `updated_at` ni `deleted_at`, con `occurred_at` default now e índices de reporting.

#### Scenario: Append-only sin soft delete

- **WHEN** se inspecciona la migración
- **THEN** `conversion_events` no tiene columnas `updated_at` ni `deleted_at`

#### Scenario: Índice compuesto CPL

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree compuesto en `(service_slug, province_slug)`

#### Scenario: FK opcional a lead

- **WHEN** se inspecciona la migración
- **THEN** `conversion_events.lead_id` es nullable con FK a `leads.id` ON DELETE SET NULL

### Requirement: Back-relation en Lead

El schema SHALL declarar `conversionEvents ConversionEvent[]` en el modelo `Lead`.

#### Scenario: Relación Lead → eventos

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Lead` declara `conversionEvents ConversionEvent[]`

## MODIFIED Requirements

### Requirement: CRM leads con eventos de conversión

El modelo `Lead` SHALL exponer la relación 1:N opcional con `ConversionEvent`.

#### Scenario: Lead con eventos atribuibles

- **WHEN** un lead tiene eventos de conversión asociados
- **THEN** se accede vía `lead.conversionEvents`
