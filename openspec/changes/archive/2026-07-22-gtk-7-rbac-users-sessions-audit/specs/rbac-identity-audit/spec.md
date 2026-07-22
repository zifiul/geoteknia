# rbac-identity-audit — Delta Spec

## ADDED Requirements

### Requirement: Enums RBAC y auditoría

El schema SHALL declarar `RoleName` (`admin`, `gestor`, `editor`, `tecnico`) y `AuditAction` con los nueve valores del ticket GTK-7.

#### Scenario: Enums presentes tras migración

- **WHEN** se aplica la migración `rbac_users_sessions_audit`
- **THEN** existen los tipos nativos `RoleName` y `AuditAction` con todos sus valores

### Requirement: Tablas de identidad y RBAC

El schema SHALL incluir modelos `Role`, `Permission`, `RolePermission`, `User` con bloque AUDIT (excepto append-only), índices y restricciones de unicidad según `data-model.md` §4.2.

#### Scenario: Unicidad de roles, permisos y email

- **WHEN** se inspecciona el schema o la migración
- **THEN** `roles.name`, `permissions.code` y `users.email` tienen restricción UNIQUE

#### Scenario: PK compuesta role_permissions con cascade

- **WHEN** se elimina un rol o permiso
- **THEN** las filas en `role_permissions` se eliminan en cascada

### Requirement: Sesiones append-only operativas

El modelo `Session` SHALL almacenar `token_hash` único, caducidad, revocación opcional y NO incluir `updated_at` ni `deleted_at`.

#### Scenario: Revocación sin mutación de fila

- **WHEN** una sesión se revoca
- **THEN** se establece `revoked_at` sin modificar `created_at`

### Requirement: Audit log inmutable

El modelo `AuditLog` SHALL registrar acciones con `AuditAction`, metadatos JSON opcionales y NO incluir `updated_at` ni `deleted_at`.

#### Scenario: Actor nullable con SET NULL

- **WHEN** se elimina un usuario referenciado en `audit_logs`
- **THEN** el log permanece con `user_id` NULL
