# admin-content-crud Specification

## ADDED Requirements

### Requirement: Fundamentos compartidos de contenido

El sistema SHALL exponer en `lib/content/` utilidades de slug (`slugify`, unicidad por tabla), errores de dominio (`ContentNotFoundError`, `ContentConflictError`, `ContentValidationError`), y sub-schemas Zod reutilizables para bloques SEO y EDITORIAL en operaciones CRUD.

#### Scenario: Slug duplicado en el mismo silo

- **WHEN** se intenta crear o actualizar un registro con `slug` ya usado por otro registro activo (`deleted_at` nulo) de la misma tabla
- **THEN** la operación falla con conflicto (409) sin insertar ni actualizar el slug conflictivo

#### Scenario: Validación SEO estricta

- **WHEN** `meta_title` supera 60 caracteres o `meta_description` supera 155, o `schema_type` no pertenece al enum `SchemaType`
- **THEN** la validación Zod rechaza antes de persistir (400)

### Requirement: Estado editorial en creación y edición CRUD

El sistema SHALL crear contenido editorial con `workflow_status = borrador_ia` y SHALL permitir marcar origen manual con `is_ai_assisted = false`. El CRUD SHALL NOT establecer `workflow_status` en `publicado` ni `aprobado` mediante schemas de entrada de create/update.

#### Scenario: Creación manual

- **WHEN** un usuario con `content.create` crea una entidad editorial
- **THEN** el registro persistido tiene `workflow_status = borrador_ia` y puede tener `is_ai_assisted = false`

#### Scenario: Intento de publicar desde CRUD

- **WHEN** el payload incluye `workflow_status = publicado`
- **THEN** la validación Zod rechaza (400) sin modificar la BD

### Requirement: CRUD por entidad con soft delete

Para cada entidad del alcance GTK-41 (servicios, geo-zonas, páginas servicio+zona, casos de estudio, categorías y posts de blog, grupos y FAQs, equipo, maquinaria, acreditaciones, lead magnets, media assets, calculator rules, organization profile, contact channels), el sistema SHALL soportar crear, leer, actualizar y soft delete (`deleted_at`) con validación Zod del cuerpo y bloques SEO/EDITORIAL cuando el modelo los incluya.

#### Scenario: Soft delete excluye de listados

- **WHEN** se soft-deletea un registro y se lista con filtros por defecto de admin
- **THEN** el registro no aparece en el listado

#### Scenario: Lectura por id de borrado

- **WHEN** se solicita un registro con `deleted_at` no nulo
- **THEN** la operación responde como no encontrado (404)

### Requirement: Relaciones M:N e integridad

El sistema SHALL gestionar tablas puente (`service_zone_coverage`, `machinery_services`, `blog_post_services`, `case_study_team_members`, `content_media`) en transacciones que validen que los IDs referenciados existen y no están soft-deleted, sin dejar filas huérfanas en la puente al actualizar conjuntos.

#### Scenario: ID de relación inválido

- **WHEN** el payload referencia un UUID inexistente o soft-deleted en una relación M:N
- **THEN** la operación falla con validación (400) sin modificar la puente

#### Scenario: Actualización de cobertura servicio-zona

- **WHEN** se actualiza el conjunto de zonas de un servicio
- **THEN** la tabla `service_zone_coverage` refleja exactamente el conjunto validado tras la transacción

### Requirement: Media assets y accesibilidad

El sistema SHALL validar que `media_assets` con `asset_type = image` incluyen `alt_text` no vacío. SHALL registrar `file_url` usando la base `MEDIA_STORAGE_BASE_URL` cuando corresponda, sin subida de binarios en este capability.

#### Scenario: Imagen sin alt_text

- **WHEN** se crea o actualiza un media asset de tipo imagen sin `alt_text`
- **THEN** la validación Zod rechaza (400)

### Requirement: Geo-zona word_count orientativo

El sistema SHALL calcular `word_count` desde el cuerpo de geo-zona y SHALL devolver un aviso (`warning`) si es menor de 800 sin impedir el guardado.

#### Scenario: Cuerpo corto con aviso

- **WHEN** el cuerpo de una geo-zona produce `word_count` &lt; 800
- **THEN** el guardado persiste y el resultado de la acción incluye warning no bloqueante

### Requirement: RBAC y config admin-only

Mutaciones de contenido editorial SHALL requerir `content.create`, `content.update` o `content.delete` según la operación. Mutaciones de `organization_profile`, `contact_channels` y `calculator_rules` SHALL requerir rol `admin`. El rol `tecnico` SHALL NOT mutar contenido.

#### Scenario: Editor crea servicio

- **WHEN** un usuario con rol `editor` invoca create de servicio con datos válidos
- **THEN** la operación tiene éxito

#### Scenario: Tecnico bloqueado

- **WHEN** un usuario con rol `tecnico` invoca cualquier mutación de contenido
- **THEN** se rechaza con 403 sin escritura en BD

#### Scenario: Editor en config singleton

- **WHEN** un `editor` intenta actualizar `organization_profile`
- **THEN** se rechaza con 403

### Requirement: Auditoría de mutaciones sensibles

Update y soft delete de entidades de contenido SHALL registrar `audit_logs` con `action = content_update` o `delete` respectivamente en la misma transacción; fallo de auditoría obligatoria SHALL revertir la transacción.

#### Scenario: content_update tras edición

- **WHEN** se completa un update válido de una entidad de contenido
- **THEN** existe entrada de auditoría `content_update` con metadata saneada (sin cuerpo editorial)

#### Scenario: delete tras soft delete

- **WHEN** se completa un soft delete válido
- **THEN** existe entrada `delete` asociada a la entidad
