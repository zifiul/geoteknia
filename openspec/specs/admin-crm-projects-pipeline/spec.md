# admin-crm-projects-pipeline Specification

## Purpose

Lectura y escritura del pipeline de proyectos en el portal `/admin`: listado paginado y filtrable, detalle con relaciones, métricas básicas del CRM y mutaciones transaccionales (estado, asignación, hitos, notas, documentos), protegido por sesión y RBAC. Materializa GTK-34/GTK-35 sobre el modelo CRM (GTK-12) y la primitiva de autorización (GTK-25).

## Requirements

### Requirement: Permiso projects.read en lecturas CRM

Toda función de lectura del pipeline en `lib/projects/` SHALL invocar `requirePermission('projects.read')` antes de consultar Prisma.

#### Scenario: Sin sesión válida

- **WHEN** se invoca `listProjects`, `getProjectDetail` o `getPipelineMetrics` sin sesión de portal válida
- **THEN** se lanza `InvalidSessionError` (tratado como 401 / redirect a login en RSC)

#### Scenario: Rol sin permiso

- **WHEN** un usuario con rol `editor` invoca cualquiera de las funciones anteriores
- **THEN** se lanza `ForbiddenError` (403)

### Requirement: Listado paginado y filtrable

El sistema SHALL exponer `listProjects` que devuelve proyectos paginados excluyendo `deleted_at` no nulo, con filtros opcionales por slug de estado, slug de servicio, slug de provincia, `technicianId` (UUID), rango `created_at`, `page` (default 1) y `pageSize` (default 20, máximo 100 validado por Zod).

#### Scenario: Paginación acotada

- **WHEN** se parsean filtros con `pageSize` mayor que 100
- **THEN** la validación Zod rechaza el input antes de ejecutar la consulta

#### Scenario: Orden estable

- **WHEN** se lista sin error
- **THEN** los resultados se ordenan por `state.order` ascendente y `createdAt` descendente

### Requirement: Scoping por rol tecnico en listado y métricas

Para usuarios con `roleName === 'tecnico'`, el `where` de `listProjects` y `getPipelineMetrics` SHALL incluir `assignedTechnicianId = user.userId` y SHALL ignorar un filtro `technicianId` distinto del propio usuario.

#### Scenario: Tecnico no ve proyectos ajenos en el listado

- **WHEN** un `tecnico` lista proyectos
- **THEN** solo aparecen filas con `assigned_technician_id` igual a su `userId` y el total refleja el mismo alcance

#### Scenario: Gestor o admin sin scoping de listado

- **WHEN** un `gestor` o `admin` lista con filtros opcionales
- **THEN** el `where` no fuerza `assignedTechnicianId` salvo que el filtro `technicianId` lo indique

### Requirement: Detalle con relaciones y anti-enumeración

`getProjectDetail(id)` SHALL cargar lead, contacto, estado, técnico, servicio, provincia, tipología, hitos, notas, documentos e historial de estado; excluir soft-deleted; aplicar `assertOwnership` tras cargar.

#### Scenario: Proyecto inexistente o soft-deleted

- **WHEN** no existe proyecto con el id o tiene `deleted_at` no nulo
- **THEN** se lanza un error de recurso no encontrado coherente con el patrón del proyecto (`ProjectNotFoundError` o equivalente)

#### Scenario: Tecnico ajeno al proyecto

- **WHEN** un `tecnico` solicita detalle de un proyecto existente asignado a otro técnico
- **THEN** la respuesta es indistinguible de inexistente para el usuario (mismo tratamiento que no encontrado)

### Requirement: Métricas de pipeline

`getPipelineMetrics` SHALL devolver, sobre el mismo `where` con scoping que el listado: conteos agrupados por servicio y por provincia (sobre tabla `projects`), tasa de cualificación (`is_qualified` true / total) y tiempo medio en horas entre `created_at` y `first_response_at` cuando existan filas con `first_response_at` no nulo; en caso contrario `null` para el tiempo medio.

#### Scenario: Sin first_response_at poblado

- **WHEN** ningún proyecto del alcance tiene `first_response_at`
- **THEN** el tiempo medio de primera respuesta es `null` (no cero)

### Requirement: Filtros URL en admin

Las páginas bajo `/admin/proyectos` SHALL ser Server Components que leen search params, validan con `projectFiltersSchema` y delegan en `lib/projects/`.

#### Scenario: Filtros compartibles

- **WHEN** un gestor abre `/admin/proyectos?stateSlug=...&page=2`
- **THEN** el listado refleja esos filtros sin requerir Server Action de lectura

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
