# conversion-events — Delta (GTK-29)

## MODIFIED Requirements

### Requirement: Registro best-effort desde captación

Además de la ingesta HTTP de GTK-32, el sistema SHALL permitir registrar `conversion_events` desde casos de uso de captación sin bloquear la respuesta al cliente.

#### Scenario: send_location tras ubicación

- **WHEN** `createLocationLead` completa el commit con éxito
- **THEN** se invoca `recordConversionEvent` con evento `send_location` de forma best-effort; un fallo del registro no revierte el lead ni cambia el `201`
