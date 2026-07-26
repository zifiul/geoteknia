# Proposal — gtk-55-blog-article

> US: [GTK-55 — Plantilla de artículo de blog (schema Article, autoría, TOC)](https://linear.app/geoteknia/issue/GTK-55/plantilla-de-articulo-de-blog-schema-article-autoria-toc)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` — `/blog/normativa/novedades-db-sec-2024` desktop `9b569160eb9c4fe4b0d2711e152940fa`, mobile `bed58bfe7d404b85a2e5a90782ae8255`.
> Dependencias: GTK-45, GTK-41, GTK-40, GTK-56 (Done). Bloquea GTK-73, GTK-54, GTK-76/77.

## Why

Plantilla pública de artículo con E-E-A-T (autor enlazado a equipo, JSON-LD `Article` extendido, TOC almacenado) y cuerpo CMS saneado para YMYL.

## What Changes

- Lectores `getPublishedBlogPostBySlug`, `listPublishedBlogPostParams`, `listRelatedServicesByBlogPost`; contrato tipado de `toc`.
- Sanitización server-side de `body` (`isomorphic-dompurify`) reutilizable para futuros renderers CMS.
- Extensión `buildArticleSchema()` (`authorUrl`, `publisher`, `dateModified`).
- Ruta `app/(public)/blog/[categoria]/[slug]/page.tsx` + organismos Stitch (`ArticleBody`, `TableOfContents`, `AuthorBox`, `RelatedServices`).
- Tests Vitest + E2E Playwright.

## Capabilities

### New

- `public-blog-article`: plantilla de artículo publicado.

### Modified

- Schemas de blog (`toc` tipado en `blog-faqs`).

## Impact

- **Contrato API:** omitido (sin Route Handlers).
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

Listado `/blog` (GTK-54), editor CMS (GTK-73), Lighthouse gate GTK-77.
