## MODIFIED Requirements

### Requirement: Sanitización de metadata

The system SHALL sanitize `metadata` with an action-specific whitelist and redact passwords, 2FA secrets and full lead PII (identifiers only). For `role_change`, the whitelist SHALL include `event` in addition to `targetUserId`, `previousRole` and `newRole`, so security sub-events such as `2fa_enabled` and `2fa_disabled` persist without adding new `AuditAction` enum values. Values for key `event` are allowed when the key name passes the sensitive-key filter (do not use key names containing `2fa` or `twofa`). For `content_update`, the whitelist SHALL include `entitySlug`, `contentType`, `entityType`, `previousStatus`, `workflowStatus` and `event` so transiciones editoriales y despublicación conserven contexto.

#### Scenario: Claves sensibles redactadas

- **WHEN** metadata incluye claves como `password` o `totpSecret`
- **THEN** esas claves no se persisten en `audit_logs.metadata`

#### Scenario: role_change con evento 2FA

- **WHEN** se registra `role_change` con `metadata: { event: '2fa_enabled', targetUserId }`
- **THEN** la metadata persistida conserva `event` y `targetUserId`

#### Scenario: content_update unpublish

- **WHEN** GTK-40 registra `content_update` con `event: 'unpublish'` y `previousStatus: 'publicado'`
- **THEN** la metadata persistida conserva `event`, `previousStatus` y `workflowStatus`

#### Scenario: Clave fuera de whitelist

- **WHEN** metadata incluye una clave fuera de whitelist para la acción
- **THEN** esa clave se descarta sin fallar el registro
