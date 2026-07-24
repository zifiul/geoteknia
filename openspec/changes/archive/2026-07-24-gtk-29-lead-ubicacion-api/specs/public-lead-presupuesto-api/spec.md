# public-lead-presupuesto-api — Delta (GTK-29)

## MODIFIED Requirements

### Requirement: reference_number único con reintento

El sistema SHALL generar `reference_number` mediante `generateUniqueReferenceNumber` compartido en `lib/leads/reference.ts`, con prefijo configurable (presupuesto SHALL seguir usando `PRE-` y formato `PRE-YYYYMMDD-XXXX`).

#### Scenario: Presupuesto tras refactor DRY

- **WHEN** se crea un lead de presupuesto después del refactor GTK-29
- **THEN** el `reference_number` sigue el formato `PRE-YYYYMMDD-XXXX` y los tests existentes de GTK-28 permanecen válidos
