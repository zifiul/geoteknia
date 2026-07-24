# transactional-email-service Specification

## Purpose

Servicio transaccional de email (Resend + React Email) para confirmaciones de lead y comunicaciones del monolito. Materializa GTK-27 y se integra con captación GTK-28.

## Requirements
### Requirement: sendLeadConfirmation envía confirmación tipada

The system SHALL expose `sendLeadConfirmation({ to, referenceNumber, technicianName, serviceName, province })` that sends an email with reference number, assigned technician (or fallback) and ≤ 48 h business-day response deadline.

#### Scenario: Envío exitoso

- **WHEN** input válido y Resend responde OK
- **THEN** retorna `{ ok: true, id }` y registra el envío por `referenceNumber`

#### Scenario: Técnico no asignado

- **WHEN** `technicianName` es null o vacío
- **THEN** la plantilla usa el texto de fallback pendiente de negocio

### Requirement: Plantilla React Email tipada

The system SHALL render subject and body from a typed React Email template without string-concatenated HTML.

#### Scenario: Render tipado

- **WHEN** se invoca `sendLeadConfirmation` con input válido
- **THEN** el cuerpo se renderiza vía componente React Email, no HTML concatenado en strings

### Requirement: Degradación elegante ante fallo Resend

The system SHALL catch Resend errors, log without unnecessary PII, and return `{ ok: false, error }` without throwing.

#### Scenario: Fallo Resend

- **WHEN** Resend devuelve error
- **THEN** la función retorna `{ ok: false, error }` sin lanzar excepción

### Requirement: Idempotencia por referenceNumber

The system SHALL skip duplicate sends for the same `referenceNumber` and return `{ ok: true, skipped: true }`.

#### Scenario: Reenvío duplicado

- **WHEN** `sendLeadConfirmation` se invoca dos veces con el mismo `referenceNumber`
- **THEN** la segunda llamada retorna `{ ok: true, skipped: true }` sin llamar a Resend de nuevo

### Requirement: Validación Zod de entrada

The system SHALL validate all input fields with Zod before calling Resend.

#### Scenario: Input inválido

- **WHEN** falta un campo obligatorio del schema de entrada
- **THEN** se lanza error de validación antes de contactar Resend

### Requirement: Confirmación tras alta de presupuesto

Tras un alta exitosa de lead de presupuesto, el sistema SHALL invocar `sendLeadConfirmation` con `serviceName` y `province` como nombres legibles (no slugs), `referenceNumber` y email del contacto. Un fallo de envío SHALL NOT revertir la transacción ni cambiar el código HTTP de éxito (`201`).

#### Scenario: Email fallido tras commit

- **WHEN** Resend devuelve error tras crear lead y proyecto
- **THEN** el cliente recibe igualmente `201` con `referenceNumber` y el lead permanece persistido
