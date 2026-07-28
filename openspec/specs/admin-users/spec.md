# admin-users Specification

## Purpose

Gestión de usuarios internos del portal admin (`/admin/usuarios`): listado, alta, edición, activación y acciones sensibles con RBAC y audit log.

## Requirements
### Requirement: Listado de usuarios internos

El portal SHALL exponer `/admin/usuarios` solo a actores con `users.read`, con listado paginado (25/50), filtros `role`, `active`, `q` en URL, y columnas nombre, email, rol, estado, 2FA y último acceso sin exponer `passwordHash` ni `twofaSecret`.

#### Scenario: Admin accede al listado

- **WHEN** un usuario con `users.read` abre `/admin/usuarios`
- **THEN** ve la tabla paginada y puede aplicar filtros reflejados en la URL

#### Scenario: Rol sin permiso

- **WHEN** un gestor/editor/técnico intenta abrir `/admin/usuarios`
- **THEN** recibe 403 vía `runWithPortalReadAccess`

### Requirement: Alta y edición de usuarios

El sistema SHALL permitir alta (`users.create`) y edición de nombre, email y rol (`users.update`), con email único validado en servidor, contraseña temporal mostrada una sola vez tras alta/reset, y acciones separadas para activar/desactivar, reset de contraseña y reset de 2FA admin-iniciado.

#### Scenario: Alta exitosa

- **WHEN** el admin envía un formulario válido de alta
- **THEN** se crea el usuario activo y se muestra la contraseña temporal una vez

#### Scenario: Guardrail último admin

- **WHEN** el único administrador activo intenta desactivarse o degradar su rol
- **THEN** la operación falla con mensaje claro sin mutar datos

### Requirement: Auditoría y sesiones

Cada acción sensible SHALL registrarse en `audit_logs` usando `role_change` para cambio de rol y `state_change` con metadata `event` y `targetUserId` para alta, activación, desactivación, reset password y reset 2FA. Cambio de rol o desactivación SHALL revocar todas las sesiones activas del usuario afectado.

#### Scenario: Cambio de rol

- **WHEN** se actualiza el rol de un usuario
- **THEN** se escribe `role_change`, se revocan sus sesiones y el usuario debe volver a autenticarse

