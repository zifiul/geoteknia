# Delta spec — admin-cms-list

## ADDED Requirements

### Requirement: Listado editorial unificado

El portal SHALL exponer `/contenido` a actores con `content.read`, listando las ocho entidades `EDITORIAL_CONTENT_TYPES` con tipo, silo, estado de workflow, autor interno y última modificación, con consultas en paralelo por modelo.

#### Scenario: Editor abre el listado

- **WHEN** un usuario con `content.read` navega a `/contenido`
- **THEN** ve métricas de workflow, filtros y tabla paginada

#### Scenario: Sin permiso de lectura

- **WHEN** un técnico sin `content.read` abre `/contenido`
- **THEN** es redirigido al gate forbidden del portal

### Requirement: Filtros y URL

El listado SHALL aceptar `type`, `status`, `silo`, `page` y `pageSize` en `searchParams`, validados con Zod, y reflejarlos en el formulario de filtros.

#### Scenario: Filtro por estado

- **WHEN** el usuario aplica filtro `status=borrador_ia`
- **THEN** la URL contiene el parámetro y las filas mostradas coinciden con ese estado

### Requirement: Acciones según RBAC

El menú "Crear contenido" y los enlaces "Editar" SHALL mostrarse solo si la sesión tiene `content.create` y `content.update` respectivamente.

#### Scenario: Editor con permisos

- **WHEN** un editor con `content.create` visita el listado
- **THEN** ve el menú crear y enlaces editar

### Requirement: Integración dashboard

El dashboard GTK-79 SHALL enlazar accesos rápidos y alertas de borradores obsoletos a `/contenido` (con filtro por defecto `borrador_ia` para editor), sin usar el stopgap de último blog post.

#### Scenario: Acceso rápido CMS

- **WHEN** un editor pulsa "Contenido editorial" en el dashboard
- **THEN** llega a `/contenido` con la URL por defecto del rol
