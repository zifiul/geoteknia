# blog-categories-posts-services — Delta Spec

## ADDED Requirements

### Requirement: Tabla blog_categories

El schema SHALL incluir `BlogCategory` con bloque SEO (slug único, meta, noindex) y bloque AUDIT.

#### Scenario: Slug único de categoría

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `blog_categories.slug`

### Requirement: Tabla blog_posts

El schema SHALL incluir `BlogPost` con FK restrict a `blog_categories` y `team_members` (`team_author_id` obligatorio); bloques SEO/EDITORIAL/AUDIT; índices en `category_id`, `team_author_id`, `published_at` y `workflow_status`.

#### Scenario: Autoría E-E-A-T obligatoria

- **WHEN** se inspecciona el schema Prisma
- **THEN** `BlogPost.teamAuthorId` es `String` (no nullable) con relación `@relation` a `TeamMember`

#### Scenario: Default editorial en artículo

- **WHEN** se crea un artículo sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

#### Scenario: Slug único de artículo

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `blog_posts.slug`

### Requirement: Tabla blog_post_services

El schema SHALL incluir `BlogPostService` como puente M:N con PK compuesta `(blog_post_id, service_id)` y cascade en FKs.

#### Scenario: PK compuesta del puente artículo-servicio

- **WHEN** se inspecciona la migración
- **THEN** la clave primaria de `blog_post_services` es `(blog_post_id, service_id)`

### Requirement: Back-relations

El schema SHALL incluir `blogPosts` en `TeamMember` y `blogPostServices` en `Service`.

#### Scenario: Relación equipo a artículos

- **WHEN** se inspecciona el schema Prisma
- **THEN** `TeamMember` declara `blogPosts BlogPost[]`

#### Scenario: Relación servicio a links de blog

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Service` declara `blogPostServices BlogPostService[]`
