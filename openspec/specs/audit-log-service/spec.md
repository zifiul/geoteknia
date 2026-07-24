# audit-log-service Specification

## Purpose

Servicio interno append-only para registrar acciones sensibles del portal (`recordAudit`). Materializa GTK-22 sobre el modelo `AuditLog` de GTK-7.

## Requirements

### Requirement: recordAudit persiste filas append-only

The system SHALL expose `recordAudit(input)` that inserts one row into `audit_logs` with `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `metadata` and `created_at`, without updating or deleting existing rows.

#### Scenario: Inserción exitosa

- **WHEN** `recordAudit` recibe un input válido con acción del enum `AuditAction`
- **THEN** se crea una fila en `audit_logs` y se devuelve `{ id }`

#### Scenario: user_id nullable

- **WHEN** `recordAudit` recibe `userId: null` (acción del sistema)
- **THEN** la inserción completa sin error

### Requirement: Acciones canónicas del enum Prisma

The system SHALL reject any `action` value not present in the Prisma enum `AuditAction`.

#### Scenario: Acción inválida

- **WHEN** `recordAudit` recibe `action: 'invalid_action'`
- **THEN** lanza error de validación antes de persistir

### Requirement: Sanitización de metadata

The system SHALL sanitize `metadata` with an action-specific whitelist and redact passwords, 2FA secrets and full lead PII (identifiers only). For `role_change`, the whitelist SHALL include `event` in addition to `targetUserId`, `previousRole` and `newRole`, so security sub-events such as `2fa_enabled` and `2fa_disabled` persist without adding new `AuditAction` enum values. Values for key `event` are allowed when the key name passes the sensitive-key filter (do not use key names containing `2fa` or `twofa`).

#### Scenario: Redacción de secretos

- **WHEN** metadata incluye claves como `password` o `totpSecret`
- **THEN** esas claves no se persisten en `audit_logs.metadata`

#### Scenario: Sub-evento 2FA en role_change

- **WHEN** se registra `role_change` con `metadata: { event: '2fa_enabled', targetUserId }`
- **THEN** la metadata persistida conserva `event` y `targetUserId`

#### Scenario: Clave no permitida

- **WHEN** metadata incluye una clave fuera de whitelist para la acción
- **THEN** esa clave se omite del JSON persistido

### Requirement: Política mustAudit vs best-effort

The system SHALL propagate persistence errors for mustAudit actions (`delete`, `publish`, `approve`, `role_change`) and swallow them for best-effort actions (`login`, `login_failed`, `reject`, `ai_generate`, `export`).

#### Scenario: mustAudit en transacción

- **WHEN** `recordAudit` falla al persistir una acción mustAudit dentro de `{ tx }`
- **THEN** la excepción se propaga al caller

#### Scenario: best-effort login

- **WHEN** `recordAudit` falla al persistir `login`
- **THEN** retorna `null` sin lanzar excepción
