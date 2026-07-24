# audit-log-service — Delta spec (GTK-24)

## MODIFIED Requirements

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
