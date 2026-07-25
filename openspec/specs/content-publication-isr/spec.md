# content-publication-isr Specification

## Purpose

Efecto de publicación al frontal: `published_at`, revalidación ISR on-demand del silo, invalidación del sitemap y cron de publicación programada. Materializa GTK-40.

## Requirements

### Requirement: Orquestación de publicación y despublicación

El sistema SHALL exponer `publishContent` y `unpublishContent` en `lib/content/publish.ts` que envuelven `applyEditorialTransition` con `targetStatus` `publicado` o `despublicado`, validan coherencia de `schema_type` con el tipo de entidad, fijan `published_at` al publicar, crean revisión forzada (`forceRevision: true`) y ejecutan revalidación ISR **después** del commit de la transacción Prisma.

#### Scenario: Publicar desde aprobado

- **WHEN** el contenido está en `aprobado` y un usuario con `content.publish` invoca `publishContent`
- **THEN** `workflow_status` es `publicado`, `published_at` no es nulo, existe auditoría `publish` y revalidación del path del silo y del tag de sitemap

#### Scenario: Publicar sin aprobar

- **WHEN** el contenido no está en `aprobado` y se invoca `publishContent`
- **THEN** la operación falla con conflicto (409) sin cambios en BD

#### Scenario: Despublicar

- **WHEN** el contenido está en `publicado` y se invoca `unpublishContent`
- **THEN** `workflow_status` es `despublicado`, `published_at` se conserva como histórico, existe `content_update` con `event='unpublish'` y se revalida path y sitemap

### Requirement: Revalidación ISR on-demand del silo

El sistema SHALL en `lib/content/revalidate.ts` derivar la ruta relativa con `buildSiloPath` (cargando slugs relacionados para `service_zone_page`, `blog_post` y contenedor para `faq`), invocar `revalidatePath(path)` y `revalidateTag(SITEMAP_CACHE_TAG)`. Los fallos de revalidación SHALL NOT revertir la transacción de publicación (best-effort con log estructurado).

#### Scenario: Blog post con categoría

- **WHEN** se publica un `blog_post` con categoría y slug válidos
- **THEN** `revalidatePath` recibe `/blog/{categorySlug}/{slug}`

#### Scenario: Fallo de caché no deshace publicación

- **WHEN** `revalidatePath` lanza error tras commit exitoso
- **THEN** el contenido permanece `publicado` y se registra el fallo sin rollback de BD

### Requirement: Validación de schema_type al publicar

Al publicar, el sistema SHALL comprobar que `schema_type` del registro es coherente con el tipo editorial (`service`→`Service`, `blog_post`→`Article`, `case_study`→`CreativeWork`, `faq_group`→`FAQPage`, etc.) y SHALL rechazar la publicación con error de validación si no encaja (sin mutar estado).

#### Scenario: Coherencia correcta

- **WHEN** un `Service` tiene `schema_type=Service` y está `aprobado`
- **THEN** la publicación continúa

#### Scenario: Incoherencia

- **WHEN** un `blog_post` tiene `schema_type=Service`
- **THEN** la publicación falla antes de transicionar estado

### Requirement: Cron de publicación programada

El sistema SHALL exponer `GET` o `POST` en `app/api/cron/publicar-programados/route.ts` **fuera** de `/api/admin`, autenticado por cabecera `Authorization: Bearer {CRON_SECRET}` con comparación en tiempo constante. SHALL consultar entidades `aprobado` con `scheduled_publish_at <= now()` y publicar cada una con `publishContent` en modo sistema; un fallo individual SHALL NOT abortar el lote. Respuesta SHALL resumir `{ published, skipped, failed }`. Sin secreto válido → 401.

#### Scenario: Secreto inválido

- **WHEN** la petición no incluye `CRON_SECRET` válido
- **THEN** responde 401 sin publicar

#### Scenario: Idempotencia

- **WHEN** el cron procesa dos veces el mismo contenido ya `publicado`
- **THEN** la segunda pasada no altera el estado (conflicto o skip documentado)

### Requirement: Server Actions de publicar y despublicar

El sistema SHALL exponer Server Actions en `app/(admin)/contenido/[type]/[id]/` que delegan en `publishContent`/`unpublishContent` con `withPermission('content.publish')` y `runContentAction`, devolviendo `ContentActionResult`.

#### Scenario: Sin permiso

- **WHEN** un usuario sin `content.publish` invoca la acción publicar
- **THEN** resultado 403 sin escritura en BD
