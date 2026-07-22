## ADDED Requirements

### Requirement: Historial append-only de versiones editoriales

El sistema SHALL almacenar cada versión de contenido publicable en tabla `content_revisions` (append-only), capturando:
- Tipo de contenido (`content_type`, string, p. ej. `'blog_post'`, `'case_study'`).
- ID del contenido (`content_id`, UUID).
- Número de versión (`version_number`, entero incremental).
- Snapshot del body editorial (`body_snapshot`, JSON con estructura H1/H2-H3/párrafos/listas).
- Snapshot de campos SEO (`seo_snapshot`, JSON con meta_title/meta_description/canonical/JSON-LD).
- Estado editorial (`workflow_status_at`, enum: `borrador_ia`, `en_revision`, `aprobado`, `publicado`).
- Editor que crea/aprueba (`editor_id`, UUID de usuario).
- Resumen de cambio (`change_summary`, p. ej. "Regenerada intro, aprobada por gestor").
- Referencia a generación IA origen (`ai_generation_id`, NULL si editada manualmente).
- Timestamp de creación (`created_at`, append-only sin UPDATE).

#### Scenario: Primera versión generada por IA
- **WHEN** RF-19 genera contenido para blog post (id=uuid_blog), creando versión inicial
- **THEN** se inserta `content_revision` con `content_type='blog_post'`, `content_id=uuid_blog`, `version_number=1`, `body_snapshot={...estructura generada...}`, `seo_snapshot={...generado...}`, `workflow_status_at='borrador_ia'`, `ai_generation_id=uuid_gen`, `editor_id=usuario_ia`.

#### Scenario: Revisión por gestor
- **WHEN** gestor revisa versión 1, hace cambios menores (ajusta H2, corrige typo), aprueba
- **THEN** se inserta `content_revision` con `version_number=2`, `body_snapshot={...editado por gestor...}`, `workflow_status_at='aprobado'`, `ai_generation_id=NULL` (no IA), `editor_id=gestor_id`, `change_summary='Corregida intro y H2 de riesgos'`.

#### Scenario: Regeneración de sección
- **WHEN** contenido publicado requiere regenerar solo H2 de "Metodología", solicita nueva generación
- **THEN** se inserta `content_revision` con `version_number=3`, snapshot completo (pero solo H2 es nuevo), `workflow_status_at='borrador_ia'`, `ai_generation_id=uuid_gen_nueva`, referencia linaje en `ai_generations.parent_generation_id`.

#### Scenario: Publicación oficial
- **WHEN** RF-21 publica versión aprobada
- **THEN** se inserta `content_revision` con `version_number=4`, snapshot idéntico a versión anterior, `workflow_status_at='publicado'`, `change_summary='Publicada'`, timestamp.

### Requirement: Índice compuesto para acceso rápido a historial

El sistema SHALL incluir índice compuesto `(content_type, content_id, version_number)` en `content_revisions` para permitir consultas eficientes de historial de una página.

#### Scenario: Recuperar última versión aprobada
- **WHEN** RF-21 consulta `SELECT * FROM content_revisions WHERE content_type='blog_post' AND content_id=uuid_blog ORDER BY version_number DESC LIMIT 1`
- **THEN** retorna rápidamente (índice acelerador).

#### Scenario: Diff entre versiones
- **WHEN** RF-20 solicita comparar versión 1 vs versión 2 de un blog post
- **THEN** consulta retorna ambas versiones (p. ej. via `WHERE (content_type, content_id, version_number) IN (('blog_post', uuid_blog, 1), ('blog_post', uuid_blog, 2))`) en milisegundos.

### Requirement: Transiciones de estado editorial

El sistema SHALL validar transiciones legales de `workflow_status_at` en `content_revisions`. Flujo permitido:
- `borrador_ia` → `en_revision` (generación lista para revisar).
- `en_revision` → `aprobado` (gestor aprobó).
- `aprobado` → `publicado` (contenido publicado).
- `borrador_ia` → `borrador_ia` (regenración de la misma sección).
- Atrás no permitido: `publicado` → `aprobado`, etc.

#### Scenario: Validación de transición ilegal
- **WHEN** RF-21 intenta transicionar `content_revision` de `publicado` a `en_revision`
- **THEN** validación en aplicación rechaza (implementada en RF-21 backend). La base de datos es append-only, registra solo inserciones.

#### Scenario: Flujo completo borrador → publicado
- **WHEN** versión 1 es `borrador_ia`, versión 2 es `en_revision`, versión 3 es `aprobado`, versión 4 es `publicado`
- **THEN** audit trail muestra todo el camino; cada transición es una fila nueva con `editor_id` y timestamp.
