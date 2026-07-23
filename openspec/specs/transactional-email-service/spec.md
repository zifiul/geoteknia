# transactional-email-service — Spec

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

### Requirement: Degradación elegante ante fallo Resend

The system SHALL catch Resend errors, log without unnecessary PII, and return `{ ok: false, error }` without throwing.

### Requirement: Idempotencia por referenceNumber

The system SHALL skip duplicate sends for the same `referenceNumber` and return `{ ok: true, skipped: true }`.

### Requirement: Validación Zod de entrada

The system SHALL validate all input fields with Zod before calling Resend.
