# admin-crm-projects-pipeline Specification

## Purpose

Lectura del pipeline de proyectos en el portal `/admin`: listado paginado y filtrable, detalle con relaciones y métricas básicas del CRM, protegido por sesión y RBAC `projects.read` con scoping por rol. Materializa GTK-34 sobre el modelo CRM (GTK-12) y la primitiva de autorización (GTK-25).

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
