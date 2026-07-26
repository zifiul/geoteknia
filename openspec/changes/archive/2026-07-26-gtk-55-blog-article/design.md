# Design — gtk-55-blog-article

## Enfoque

- **Datos:** lectores en `lib/content/blog-faqs.ts` con `PUBLISHED_EDITORIAL_WHERE`; categoría por `category.slug`; autor vía `getPublishedTeamMemberBySlug(teamAuthor.slug)` (ocultar caja si no publicado).
- **TOC:** contrato Zod `blogTocSchema` en `lib/content/schemas/blog-toc.ts`; parse defensivo en lectura; UI solo consume array almacenado (sin reparsear `body`).
- **Body:** HTML almacenado en CMS; sanitizar en RSC con `isomorphic-dompurify` (`lib/content/sanitize-cms-html.ts`) antes de `ArticleBody`.
- **JSON-LD:** extender `buildArticleSchema`; `publisher` desde `getOrganizationProfile()` + `NEXT_PUBLIC_SITE_URL`; `datePublished`/`dateModified` desde `publishedAt`/`updatedAt` ISO.
- **UI Stitch:** hero con categoría, metadatos de lectura, imagen LCP `priority`; layout lectura con sidebar TOC en desktop y `<details>` colapsable en móvil; tipografía `prose` acotada en `max-w-[70ch]`.

## Threat model (GTK-55)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| XSS | HTML CMS / IA en `body` | `sanitizeCmsHtml` server-only; tests con probe tipo DEV_SEO |
| IDOR | Artículo borrador | `PUBLISHED_EDITORIAL_WHERE` + match categoría; 404 unificado |
| Open redirect | Enlaces en body | Sanitizer limita `href` a http(s) y rutas relativas |
| PII | Autor no publicado | No mostrar caja; JSON-LD sin `author.url` si no hay perfil |
| SEO | Contenido no indexable | `buildMetadata` + `noindex` del bloque SEO |

## Decisiones

- **Formato body:** HTML saneado (GTK-73 editor se alineará a este contrato).
- **`dateModified`:** `updatedAt` del post publicado.
- **`revalidate = 3600`** en la ruta.
- Eventos `select_content` (TOC) y CTA engagement vía `pushRawDataLayer`; `scroll_depth` con tracker dedicado ligero.

## Reutilización

`buildMetadata`, `PUBLISHED_EDITORIAL_WHERE`, breadcrumbs `blog_post`, `getPublishedTeamMemberBySlug`, `BudgetCta`, `resolveMediaFileUrl`.
