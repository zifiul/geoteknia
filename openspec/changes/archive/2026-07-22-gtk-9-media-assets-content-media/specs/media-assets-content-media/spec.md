# media-assets-content-media — Delta Spec

## ADDED Requirements

### Requirement: Enum AssetType

El schema SHALL declarar `AssetType` con valores `image`, `pdf` y `document`.

#### Scenario: Enum presente tras migración

- **WHEN** se aplica la migración `media_assets_content_media`
- **THEN** existe el tipo nativo `AssetType` con los tres valores

### Requirement: Tabla media_assets

El schema SHALL incluir `MediaAsset` con bloque AUDIT, `file_url` obligatorio, `include_in_image_sitemap` default `true` e índices en `asset_type` e `include_in_image_sitemap`.

#### Scenario: Defaults de sitemap de imágenes

- **WHEN** se crea un activo sin especificar `include_in_image_sitemap`
- **THEN** el valor por defecto es `true`

### Requirement: Tabla content_media polimórfica

El schema SHALL incluir `ContentMedia` con FK a `media_assets` (cascade), índice compuesto `(content_type, content_id)` y SIN FK relacional sobre `content_id`.

#### Scenario: Índice compuesto para galería

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `(content_type, content_id)`

#### Scenario: Sin FK polimórfica

- **WHEN** se inspecciona el schema Prisma
- **THEN** `content_id` es UUID escalar sin `@relation` hacia entidades de contenido
