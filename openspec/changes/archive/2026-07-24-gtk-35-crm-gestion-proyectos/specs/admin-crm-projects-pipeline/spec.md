# admin-crm-projects-pipeline Specification (delta)

## ADDED Requirements

### Requirement: Transición de estado con historial append-only

El sistema SHALL actualizar `projects.state_id` y crear una fila en `project_state_history` (`from_state_id`, `to_state_id`, `changed_by_id`, `note` opcional) en una única transacción Prisma.

#### Scenario: Transición válida

- **WHEN** un usuario autorizado invoca el cambio de estado hacia un slug de estado distinto y el estado actual no es terminal
- **THEN** `state_id` del proyecto coincide con el estado destino y existe exactamente una fila nueva en `project_state_history` con los IDs correctos y `changed_by_id` = usuario de sesión

#### Scenario: Desde estado terminal

- **WHEN** el estado actual del proyecto tiene `is_terminal = true`
- **THEN** la operación falla con conflicto (409) sin modificar proyecto ni historial

#### Scenario: Mismo estado

- **WHEN** el slug destino coincide con el estado actual
- **THEN** la operación falla con conflicto (409) sin modificar datos

### Requirement: Asignación de técnico y primera respuesta

El sistema SHALL permitir asignar `assigned_technician_id` con permiso `projects.assign` y SHALL fijar `first_response_at` de forma idempotente la primera vez que ocurra una asignación de técnico o un cambio de estado válido, lo que suceda antes.

#### Scenario: Primera asignación fija first_response_at

- **WHEN** se asigna técnico a un proyecto con `first_response_at` nulo
- **THEN** `assigned_technician_id` se actualiza y `first_response_at` queda con timestamp no nulo

#### Scenario: Idempotencia de first_response_at

- **WHEN** se repite asignación o mutación que dispararía primera respuesta y `first_response_at` ya está poblado
- **THEN** `first_response_at` no cambia

### Requirement: Hitos, notas y documentos

El sistema SHALL crear hitos con `due_date`/`status` opcionales, completar hitos fijando `completed_at`, crear notas con `author_id` = sesión, y adjuntar documentos con `doc_type`, `uploaded_by_id` = sesión y al menos uno de `media_asset_id` o `file_url`.

#### Scenario: Documento sin fuente

- **WHEN** el input de documento no incluye `mediaAssetId` ni `fileUrl`
- **THEN** la validación Zod rechaza antes de persistir (400)

#### Scenario: Soft delete de nota o documento

- **WHEN** un usuario con `projects.delete` borra nota o documento de un proyecto en su alcance
- **THEN** se establece `deleted_at` sin borrado físico

### Requirement: RBAC y ownership en mutaciones

Toda mutación SHALL usar `withPermission` con el permiso atómico adecuado, cargar el proyecto (excluyendo soft-deleted), aplicar `assertOwnership` y devolver 404 si el proyecto no existe y 403 si falta permiso u ownership.

#### Scenario: Gestor o admin global

- **WHEN** un `gestor` o `admin` muta cualquier proyecto existente
- **THEN** la operación procede si el resto de reglas de dominio se cumplen

#### Scenario: Tecnico en proyecto ajeno

- **WHEN** un `tecnico` intenta mutar un proyecto no asignado a su `userId`
- **THEN** se rechaza con 403 antes de escribir

#### Scenario: Tecnico sin permiso de asignación

- **WHEN** un `tecnico` intenta asignar técnico
- **THEN** se rechaza con 403 por falta de `projects.assign`

### Requirement: Auditoría de acciones críticas

Cambio de estado, asignación de técnico y soft delete de nota/documento SHALL registrar `audit_logs` en la misma transacción con acciones `state_change`, `assign` o `delete` respectivamente; fallo de auditoría obligatoria SHALL revertir la transacción.

#### Scenario: state_change en audit

- **WHEN** se completa un cambio de estado válido
- **THEN** existe entrada de auditoría con `action = state_change` y metadata saneada (slugs de estado, sin PII)

#### Scenario: assign en audit

- **WHEN** se completa una asignación válida
- **THEN** existe entrada con `action = assign` y metadata con identificador de técnico (UUID), sin PII de contacto
