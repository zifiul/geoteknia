# conversion-events — Delta (GTK-31)

## MODIFIED Requirements

### Requirement: Registro best-effort desde captación

Además de los eventos ya cableados (GTK-28 presupuesto, GTK-29 ubicación), el sistema SHALL registrar `generate_lead` con `leadType=licitacion` tras `createTenderLead` de forma best-effort.

#### Scenario: generate_lead tras licitación

- **WHEN** `createTenderLead` completa el commit con éxito
- **THEN** se invoca `recordConversionEvent` con `eventName=generate_lead`, `leadType=licitacion` y `value` igual al importe estimado si se aportó; un fallo del registro no revierte el lead ni cambia el `201`
