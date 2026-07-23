# Design — gtk-13-blog-categories-posts-services

> Variante Harness DB — `blog_categories`, `blog_posts`, `blog_post_services` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`BlogCategory`:** taxonomía editorial RF-06 con bloque SEO (slug, meta, noindex) y AUDIT.
2. **`BlogPost`:** artículo con FK restrict a `blog_categories` y `team_members` (autoría E-E-A-T obligatoria); bloques SEO/EDITORIAL/AUDIT completos; campos `toc` JSON y `reading_minutes`.
3. **`BlogPostService`:** puente M:N artículo↔servicio pillar para linking SEO (§8.2); cascade en FKs.
4. **Back-relations:** `blogPosts` en `TeamMember`; `blogPostServices` en `Service`.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `onDelete: Restrict` en FKs de `blog_posts` | Cascade | Proteger categorías y fichas de equipo |
| `onDelete: Cascade` en puente | Restrict | Limpiar links al borrar artículo o servicio |
| `team_author_id` obligatorio | Nullable | E-E-A-T exige autoría real |
| Sin seed inline | Seed en GTK-17 | Taxonomía editorial pendiente de confirmación |
| Índice en `workflow_status` | Índice parcial ahora | GTK-19 cubre índices avanzados |

## Migración

- Nombre: `blog_categories_posts_services`
- DDL: 3 tablas, unique slug en categorías y posts, PK compuesta en puente
- Índices: `category_id`, `team_author_id`, `published_at`, `workflow_status`
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No directa en blog; autoría vía `team_members` (PII gestionada allí) |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | `body` puede generarse asistido (RF-19); inputs técnicos sin PII (RNF-IA) |
| Linking interno | Puente M:N controlado; no expone datos sensibles |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
