# admin-cms-editorial-workflow

## ADDED Requirements

### Requirement: Workflow UI alineada al grafo editorial

El editor CMS SHALL mostrar solo acciones de transición válidas según `EDITORIAL_TRANSITIONS` y permisos RBAC (`content.update` / `content.publish`).

#### Scenario: Transición no permitida

- **WHEN** el usuario fuerza una transición inválida vía Server Action
- **THEN** el sistema responde con conflicto (409) y la UI muestra el mensaje de error

### Requirement: Aprobación con verificación técnica YMYL

Al aprobar contenido, la UI SHALL exigir confirmación explícita del aviso de verificación técnica antes de invocar `approveContent`.

#### Scenario: Aprobar sin confirmar aviso

- **WHEN** el usuario intenta confirmar aprobación sin marcar la verificación
- **THEN** la acción no se envía al servidor

### Requirement: Historial de versiones

El editor SHALL listar revisiones con número de versión, autor, estado editorial y fecha, sin comparación visual (diff).

#### Scenario: Listar revisiones

- **WHEN** el contenido tiene revisiones en `content_revisions`
- **THEN** `listContentRevisions` devuelve filas ordenadas por `versionNumber` descendente para el par type/id

### Requirement: Publicación y programación

La UI SHALL permitir publicar, despublicar, programar y cancelar programación solo en estado `aprobado`, gateado por `content.publish`.

#### Scenario: Programar fecha pasada

- **WHEN** se envía `scheduledPublishAt` en el pasado
- **THEN** la Server Action rechaza con error de validación
