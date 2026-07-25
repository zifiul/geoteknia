## MODIFIED Requirements

### Requirement: Metadatos de revisión y aprobación

Al transicionar a `en_revision`, el sistema SHALL fijar `reviewed_by_id` al usuario autenticado. Al transicionar a `aprobado`, SHALL fijar `approved_by_id` y `approved_at`. Al transicionar a `publicado` vía el orquestador GTK-40, SHALL fijar `published_at` al instante de la transición. Al despublicar, SHALL conservar `published_at` como dato histórico.

#### Scenario: Aprobación registra autoría

- **WHEN** se completa la transición a `aprobado`
- **THEN** el registro editorial tiene `approved_by_id` del actor y `approved_at` no nulo

#### Scenario: Publicación fija fecha

- **WHEN** GTK-40 completa transición a `publicado`
- **THEN** `published_at` no es nulo y refleja el momento de publicación

### Requirement: Versionado en content_revisions

El sistema SHALL crear fila en `content_revisions` con `version_number` incremental, `body_snapshot`, `seo_snapshot`, `workflow_status_at`, `editor_id` y `ai_generation_id` opcional cuando la operación cambia el cuerpo o SEO del contenido **o** cuando `forceRevision: true` (publicar/despublicar GTK-40). Las transiciones de solo estado sin `forceRevision` (p. ej. `en_revision → aprobado`) SHALL NOT crear revisión. Regeneración (`rechazado → borrador_ia` con cuerpo actualizado) SHALL crear revisión y MAY enlazar `ai_generation_id`.

#### Scenario: Aprobar sin snapshot

- **WHEN** se aprueba contenido sin modificar cuerpo ni SEO y sin `forceRevision`
- **THEN** no se inserta fila nueva en `content_revisions` y `current_version` no cambia

#### Scenario: Publicar con traza YMYL

- **WHEN** GTK-40 publica con `forceRevision: true`
- **THEN** se inserta `content_revision` con el snapshot del estado publicado

#### Scenario: Regeneración con versión

- **WHEN** el cuerpo cambia en una operación que crea revisión
- **THEN** `version_number` es `current_version + 1` y la entidad actualiza `current_version` en la misma transacción

### Requirement: Registro polimórfico de entidades editoriales

El sistema SHALL validar en dominio que `content_type` y `content_id` referencian una entidad publicable con bloque EDITORIAL, incluyendo `team_member`, `machinery` y `faq_group` además de los tipos GTK-39. Entidad inexistente o soft-deleted SHALL responder como no encontrada (404).

#### Scenario: Tipo de contenido desconocido

- **WHEN** se invoca una transición con `content_type` no registrado
- **THEN** la operación falla con validación o no encontrado sin mutar BD

#### Scenario: Maestro publicable

- **WHEN** `content_type` es `team_member` y la entidad existe
- **THEN** las transiciones editoriales incluida publicación están permitidas según el grafo

### Requirement: Contrato compartido con publicación (GTK-40)

`lib/content/workflow.ts` SHALL ser la fuente única del grafo consumida por GTK-39 y GTK-40. GTK-39 SHALL validar y persistir estado hasta `aprobado`. GTK-40 SHALL ejecutar transiciones `aprobado → publicado` y `publicado → despublicado` con efectos de frontal (ISR, sitemap, `published_at`, revisión forzada) sin duplicar el grafo.

#### Scenario: Grafo único

- **WHEN** GTK-40 publica contenido
- **THEN** usa `applyEditorialTransition` del mismo módulo que GTK-39
