# Proposal — gtk-9-media-assets-content-media

> US: [GTK-9 — Activos multimedia y galería polimórfica de contenido](https://linear.app/geoteknia/issue/GTK-9/activos-multimedia-y-galeria-polimorfica-de-contenido)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7 | Desbloquea: GTK-8, GTK-13, GTK-15, GTK-18, GTK-20

## Why

Casi todas las entidades de contenido publicable referencian `hero_image_id`/`og_image_id`/`photo_id`/`file_id` hacia `media_assets`. Centraliza alt-text (RNF-A11Y), formatos y el flag de sitemap de imágenes (RF-13). La tabla puente `content_media` asocia activos a casos, zonas y servicios de forma polimórfica.

## What Changes

- Añadir enum `AssetType` (`image`, `pdf`, `document`).
- Crear modelos `MediaAsset` (bloque AUDIT) y `ContentMedia` (puente polimórfica sin FK dura sobre `content_id`).
- Migración `media_assets_content_media` con índices en `asset_type`, `include_in_image_sitemap` y `(content_type, content_id)`.
- Sin seed (activos se cargan vía portal/CRUD).

## Capabilities

### New Capabilities

- `media-assets-content-media`: repositorio central de activos y galería polimórfica.

### Modified Capabilities

- Ninguna.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** dos tablas + un enum en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII en activos públicos; integridad polimórfica en `/lib/`.
- **Tickets desbloqueados:** GTK-18, GTK-20, GTK-15, GTK-13, GTK-8.

## Fuera de alcance

- Upload de ficheros o almacenamiento (URLs externas).
- FK relacional sobre `content_media.content_id` (polimorfismo).
- Seed de activos de ejemplo.
