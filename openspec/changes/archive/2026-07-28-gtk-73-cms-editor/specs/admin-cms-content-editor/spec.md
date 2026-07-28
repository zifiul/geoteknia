# Delta spec — admin-cms-content-editor

## ADDED Requirements

### Requirement: Editor por tipo en `/contenido/[type]/[id]`

El portal SHALL exponer un editor autenticado en `/contenido/[type]/[id]` con `type` del catálogo GTK-72 y `id` UUID o `nuevo` para alta.

#### Scenario: Editor con permiso de lectura

- **WHEN** un usuario con `content.read` abre un id existente
- **THEN** ve los campos del tipo y puede guardar si tiene `content.update`

#### Scenario: Alta con permiso de creación

- **WHEN** un usuario con `content.create` abre `id=nuevo`
- **THEN** puede crear vía `createXxx` y es redirigido al id creado

#### Scenario: Sin permiso de contenido

- **WHEN** un usuario sin `content.read` (p. ej. técnico) accede al editor
- **THEN** recibe denegación de acceso (portal forbidden / 403 en guardado)

### Requirement: Bloque SEO con contadores

El bloque SEO SHALL validar con `seoBlockSchema` y mostrar contadores en vivo para meta título (60) y meta descripción (155).

#### Scenario: Slug duplicado

- **WHEN** el backend devuelve `CONFLICT` por slug duplicado
- **THEN** el formulario muestra error sin descartar el resto de campos

### Requirement: Vista previa fiel (tipos con plantilla pública)

Para `service`, `geo_zone`, `case_study` y `blog_post`, la vista previa SHALL renderizar los mismos organisms que la plantilla pública, alimentados por un adaptador desde el estado del formulario (no el loader de publicados).

#### Scenario: Borrador en preview

- **WHEN** el contenido está en `borrador_ia` o no guardado
- **THEN** la vista previa sigue mostrando el estado actual del formulario

### Requirement: Guardado sin publicar

Guardar SHALL NOT cambiar el estado a `publicado` ni ejecutar transiciones de workflow (GTK-75).

#### Scenario: Guardar borrador

- **WHEN** el usuario guarda un servicio en borrador
- **THEN** el `workflowStatus` permanece en un estado CRUD permitido (p. ej. `borrador_ia`)
