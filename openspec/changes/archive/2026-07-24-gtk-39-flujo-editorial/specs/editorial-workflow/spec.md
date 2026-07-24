# editorial-workflow — Delta spec (GTK-39)

## ADDED Requirements

### Requirement: Grafo de transiciones editorial

El sistema SHALL exponer en `lib/content/workflow.ts` el grafo único de estados `WorkflowStatus` con transiciones permitidas exactamente: `borrador_ia → en_revision`, `en_revision → aprobado`, `en_revision → rechazado`, `aprobado → publicado`, `publicado → despublicado`, `rechazado → borrador_ia`. Cualquier otra transición SHALL fallar con conflicto (409) vía `ContentConflictError`.

#### Scenario: Transición válida submit

- **WHEN** el contenido está en `borrador_ia` y se solicita transición a `en_revision`
- **THEN** `assertTransition` no lanza error

#### Scenario: Salto inválido a publicado

- **WHEN** el contenido está en `borrador_ia` y se solicita transición a `publicado`
- **THEN** la operación falla con conflicto (409) sin cambiar el estado en BD

### Requirement: Server Actions de transición con RBAC

El sistema SHALL exponer Server Actions en `app/(admin)/contenido/[type]/[id]/actions.ts` que devuelven `ContentActionResult`, envueltas en `withPermission`. Revisar, rechazar y aprobar SHALL requerir `content.update`. Publicar y despublicar SHALL requerir `content.publish`. Sin sesión SHALL mapear a 401; sin permiso a 403.

#### Scenario: Editor aprueba su propio borrador

- **WHEN** un usuario con `content.update` que también editó el contenido ejecuta la transición a `aprobado` desde `en_revision`
- **THEN** la operación tiene éxito y persiste `approved_by_id` y `approved_at`

#### Scenario: Publicar sin content.publish

- **WHEN** un usuario con solo `content.update` intenta transición a `publicado`
- **THEN** se rechaza con 403 sin escritura en BD

### Requirement: Metadatos de revisión y aprobación

Al transicionar a `en_revision`, el sistema SHALL fijar `reviewed_by_id` al usuario autenticado. Al transicionar a `aprobado`, SHALL fijar `approved_by_id` y `approved_at`. El sistema SHALL NOT fijar `published_at` en este capability.

#### Scenario: Aprobación registra autoría

- **WHEN** se completa la transición a `aprobado`
- **THEN** el registro editorial tiene `approved_by_id` del actor y `approved_at` no nulo

### Requirement: Versionado en content_revisions

El sistema SHALL crear fila en `content_revisions` con `version_number` incremental, `body_snapshot`, `seo_snapshot`, `workflow_status_at`, `editor_id` y `ai_generation_id` opcional **solo** cuando la operación cambia el cuerpo o SEO del contenido. Las transiciones de solo estado (p. ej. `en_revision → aprobado`) SHALL NOT crear revisión. Regeneración (`rechazado → borrador_ia` con cuerpo actualizado) SHALL crear revisión y MAY enlazar `ai_generation_id`.

#### Scenario: Aprobar sin snapshot

- **WHEN** se aprueba contenido sin modificar cuerpo ni SEO
- **THEN** no se inserta fila nueva en `content_revisions` y `current_version` no cambia

#### Scenario: Regeneración con versión

- **WHEN** el cuerpo cambia en una operación que crea revisión
- **THEN** `version_number` es `current_version + 1` y la entidad actualiza `current_version` en la misma transacción

### Requirement: Auditoría de transiciones sensibles

Transiciones con acciones `approve`, `reject` y `publish` SHALL registrar `audit_logs` con la acción correspondiente en la misma transacción Prisma (mustAudit). Submit a revisión, despublicar y regenerar a borrador SHALL usar `content_update`. Fallo de auditoría obligatoria SHALL revertir la transacción.

#### Scenario: Rechazo auditado

- **WHEN** se rechaza contenido desde `en_revision`
- **THEN** existe entrada `reject` con metadata saneada (sin cuerpo editorial)

### Requirement: Aviso de verificación técnica YMYL

El envelope `ContentActionResult` SHALL exponer indicación de verificación técnica obligatoria antes de aprobar (p. ej. `requiresTechnicalVerification: true` en datos de éxito o `warning` no bloqueante) tras enviar a revisión o al aprobar, según diseño del change.

#### Scenario: Aviso tras submit

- **WHEN** la transición a `en_revision` tiene éxito
- **THEN** el resultado incluye aviso de verificación técnica antes de aprobar

### Requirement: Registro polimórfico de entidades editoriales

El sistema SHALL validar en dominio que `content_type` y `content_id` referencian una entidad publicable con bloque EDITORIAL del alcance GTK-39 (servicios, geo-zonas, páginas servicio×zona, casos, blog, FAQs). Entidad inexistente o soft-deleted SHALL responder como no encontrada (404).

#### Scenario: Tipo de contenido desconocido

- **WHEN** se invoca una transición con `content_type` no registrado
- **THEN** la operación falla con validación o no encontrado sin mutar BD

### Requirement: Contrato compartido con publicación (GTK-40)

`lib/content/workflow.ts` SHALL ser la fuente única del grafo consumida por GTK-39 y GTK-40. GTK-39 SHALL validar y persistir estado hasta `aprobado` y las transiciones `aprobado → publicado` y `publicado → despublicado` sin ejecutar efectos de publicación en el frontal.

#### Scenario: Publicar solo cambia estado

- **WHEN** un usuario con `content.publish` ejecuta transición a `publicado` desde `aprobado`
- **THEN** `workflow_status` pasa a `publicado` y `published_at` permanece sin cambio por este capability
