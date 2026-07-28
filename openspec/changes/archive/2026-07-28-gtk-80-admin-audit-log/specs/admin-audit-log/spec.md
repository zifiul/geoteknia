# admin-audit-log

## ADDED Requirements

### Requirement: Acceso RBAC a auditoría

El portal SHALL exponer `/admin/auditoria` solo a actores con `audit.read`; el resto recibe 403 coherente con el layout admin.

#### Scenario: Rol sin permiso

- **WHEN** un gestor/editor/técnico navega a `/admin/auditoria`
- **THEN** el sistema redirige a `/admin/forbidden` sin listar filas de `audit_logs`

### Requirement: Listado paginado y filtros en URL

El listado SHALL ordenar por `createdAt DESC`, paginar y reflejar filtros `action`, `userId`, `entityType`, `entityId`, `from`, `to` en la query string.

#### Scenario: Filtro por acción

- **WHEN** la URL incluye `action=login_failed`
- **THEN** `listAuditLogs` aplica `where.action = login_failed`

### Requirement: Detalle de evento en drawer

El detalle SHALL mostrarse en un drawer sobre el listado (parámetro `event` = UUID del log), con metadata JSON almacenada, IP completa y user agent; el listado no carga `metadata` pesada.

#### Scenario: Abrir detalle

- **WHEN** el admin abre `?event=<uuid>` válido
- **THEN** se muestra el drawer con metadata y sin registrar un nuevo evento de auditoría

### Requirement: Deep-links a entidades

Cuando `entityType` es `projects` y hay `entityId`, la UI SHALL enlazar a `/admin/proyectos/[entityId]`. Para tipos de `EDITORIAL_CONTENT_TYPES`, SHALL omitir el enlace hasta que exista el editor GTK-73.

#### Scenario: Evento de proyecto

- **WHEN** un evento tiene `entityType=projects`
- **THEN** el detalle incluye enlace al detalle de proyecto
