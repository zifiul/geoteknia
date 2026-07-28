# Delta spec — admin-dashboard

## ADDED Requirements

### Requirement: Dashboard home por rol

El portal SHALL mostrar en `/admin` un dashboard con KPIs, alertas, accesos rápidos y actividad reciente según el rol del usuario autenticado.

#### Scenario: Administrador ve CRM, CMS e IA

- **WHEN** un usuario con rol `admin` accede a `/admin`
- **THEN** ve KPIs de pipeline, contenido en revisión y uso IA del periodo seleccionado
- **AND** ve alertas SLA y accesos a pipeline e IA

#### Scenario: Técnico solo ve ámbito asignado

- **WHEN** un usuario con rol `tecnico` accede a `/admin`
- **THEN** no ve KPIs globales de CMS ni coste IA
- **AND** la actividad y métricas de proyectos están limitadas a sus asignaciones

#### Scenario: Periodo opcional

- **WHEN** la URL incluye `?periodo=7d` o `?periodo=30d`
- **THEN** los KPIs temporales usan ese rango de fechas

### Requirement: Agregación CMS editorial

El sistema SHALL contar estados `workflowStatus` sumando los ocho tipos de `EDITORIAL_CONTENT_TYPES` con consultas en paralelo.

#### Scenario: Conteos por estado

- **WHEN** se solicitan métricas CMS con permiso `content.read`
- **THEN** se devuelven totales para borrador IA, en revisión, programados y publicados recientes

### Requirement: Alerta SLA primera respuesta

El sistema SHALL identificar proyectos con `firstResponseAt` nulo y antigüedad superior a 48 horas dentro del scoping del usuario.

#### Scenario: Enlace accionable

- **WHEN** existen proyectos en SLA vencido
- **THEN** la alerta enlaza a `/admin/proyectos?slaOverdue=true`
