# Proposal — gtk-54-blog-listing

> US: [GTK-54 — Blog: listado, categorías y paginación SEO-friendly](https://linear.app/geoteknia/issue/GTK-54/blog-listado-categorias-y-paginacion-seo-friendly)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` — ver comentario Linear (índice desktop `1bda181b907b417893ecf95240a3f794`, mobile `1294a1575d98432a922f9dab4b0d25a2`; categorías normativa/técnicas/geología y estados vacíos).
> Dependencias: GTK-55, GTK-41, GTK-47 (cerradas). Consumidor GTK-78 Fase 2 junto con GTK-50.

## Why

El índice `/blog` y los listados por categoría captan tráfico informacional y enlazan al silo editorial hacia servicios transaccionales (RF-06, §8.2/§8.4). GTK-55 ya entrega la plantilla de artículo; faltan las rutas de listado con paginación indexable.

## What Changes

- Rutas RSC `app/(public)/blog/page.tsx` y `app/(public)/blog/[categoria]/page.tsx` con `?page=`, metadata vía `buildListingCanonical` + `resolveListingRobots({ hasActiveFilters: false })`, `PaginationLinks`, JSON-LD `BreadcrumbList`.
- Lecturas `listPublishedBlogCategories()`, `listPublishedBlogPostsByCategory()`, `getPublishedBlogCategoryBySlug()`.
- Organismos `ArticleCard`, `CategoryNav`, `BlogPagination`, estado vacío por categoría, tracking `view_item_list` / `select_item` / `filter_use`.
- Tests Vitest + E2E Playwright.

## Capabilities

### New

- `public-blog-listing`: índice y categorías del blog con paginación SEO-friendly.

### Modified

- Ninguna spec viva fuera del delta del change.

## Impact

- **Contrato API:** omitido (sin Route Handlers).
- **Sitemap:** decisión pendiente — no añadir `/blog` ni categorías en `sitemap-sources` en este change (gap 4 del ticket); documentar en PR.
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

Plantilla de artículo (GTK-55), Lighthouse CI (GTK-77), verificación integrada GTK-78 más allá del consumo en estas rutas.
