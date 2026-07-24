# transactional-email-service — Delta (GTK-28)

## ADDED Requirements

### Requirement: Confirmación tras alta de presupuesto

Tras un alta exitosa de lead de presupuesto, el sistema SHALL invocar `sendLeadConfirmation` con `serviceName` y `province` como nombres legibles (no slugs), `referenceNumber` y email del contacto. Un fallo de envío SHALL NOT revertir la transacción ni cambiar el código HTTP de éxito (`201`).

#### Scenario: Email fallido tras commit

- **WHEN** Resend devuelve error tras crear lead y proyecto
- **THEN** el cliente recibe igualmente `201` con `referenceNumber` y el lead permanece persistido
