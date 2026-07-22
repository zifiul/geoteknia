# Design — gtk-9-media-assets-content-media

> Variante Harness DB — `media_assets` + `content_media` en `prisma/schema.prisma`.

## Enfoque técnico

1. **Enum `AssetType`:** tres valores nativos PostgreSQL para clasificar activos.
2. **`MediaAsset`:** repositorio central con bloque AUDIT; `include_in_image_sitemap` default `true`.
3. **`ContentMedia`:** puente polimórfica (`content_type` + `content_id`) sin FK sobre `content_id`; integridad garantizada en `/lib/`.
4. **FK dura:** solo `content_media.media_asset_id` → `media_assets` con `onDelete: Cascade`.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Polimorfismo sin FK en `content_id` | Tablas puente por entidad | Prisma no soporta polimorfismo nativo; patrón del `data-model.md` |
| `include_in_image_sitemap` default true | default false | RF-13: inclusión en sitemap salvo exclusión explícita |
| Sin bloque AUDIT en `ContentMedia` | AUDIT completo | Tabla puente de orden; trazabilidad en el activo padre |
| `file_url` como String | Binario en BD | RNF-PERF: almacenamiento externo |

## Migración

- Nombre: `media_assets_content_media`
- DDL: 1 enum, 2 tablas, 3 índices btree
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No en activos públicos; documentos privados en `project_documents` (GTK-12) |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Integridad | Polimórfica validada en dominio `/lib/` |
| IA / prompts | Sin PII en prompts (RNF-IA) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
