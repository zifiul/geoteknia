# Design — gtk-54-blog-listing

## Enfoque

- **Datos:** RSC; `listPublishedBlogPostsByCategory({ categorySlug?, page, pageSize })` con `PUBLISHED_EDITORIAL_WHERE` en posts; categorías con `deletedAt: null` (sin bloque EDITORIAL). Categoría inexistente → `notFound()` en `/blog/[categoria]`.
- **SEO:** `BLOG_CATALOG_FILTER_KEYS = []` (solo `page`); `hasActiveFilters` siempre `false` en `resolveListingRobots`; canonical autoreferenciado en todas las páginas paginadas. Metadata de categoría desde `meta_title` / `meta_description` con fallback; respetar `blog_categories.noindex` en robots. No usar `buildMetadata()` (bloque SEO incompleto en categorías).
- **UI (Stitch):** hero editorial, `CategoryNav` scroll horizontal en móvil, grid 1/2/3 columnas, tarjetas con imagen hero, chip de categoría, autor y fecha.
- **Analytics:** `pushRawDataLayer` sin `/api/eventos`.

## Threat model (GTK-54)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Entrada URL | `page` o slug de categoría maliciosos | Clamp de página en servidor; slug solo resuelto vía Prisma |
| XSS | Títulos/excerpt CMS en tarjetas | React escape; sin `dangerouslySetInnerHTML` en listado |
| PII | Datos de autor | Solo `fullName` y slug públicos ya expuestos en equipo |
| SEO | Paginación no indexable | `index,follow` con `hasActiveFilters: false`; `rel=prev/next` |
| Enumeración | Categoría inexistente | 404 explícito |

## Decisiones

- `BLOG_CATALOG_PAGE_SIZE = 12` (alineado con GTK-50).
- Imagen de tarjeta: `heroImageId` + batch de media (mismo patrón que catálogo de casos).
- Sitemap: **no** modificar `sitemap-sources` en este change; seguimiento en GTK-42/PR.

## Integración GTK-78

Reutilizar `analyzeListingSearchParams`, `buildListingCanonical`, `buildPaginationNavLinks`, `<PaginationLinks />`, `resolveListingRobots` — sin duplicar lógica en el change.
