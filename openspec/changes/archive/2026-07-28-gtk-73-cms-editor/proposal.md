# Proposal — gtk-73-cms-editor

**Linear:** [GTK-73](https://linear.app/geoteknia/issue/GTK-73/cms-editor-de-contenido-con-bloque-seo-y-vista-previa-fiel-a-la) — CMS: editor de contenido con bloque SEO y vista previa fiel a la plantilla.

## Qué y por qué

Construir la ruta `/contenido/[type]/[id]` (incl. `id=nuevo`) con formulario por tipo, bloque SEO, editor de cuerpo y vista previa que reutiliza los **organisms** de las plantillas públicas, consumiendo las Server Actions de CRUD ya existentes (GTK-41). Sin nuevas mutaciones ni Route Handlers.

## Alcance

- RSC `page.tsx` + `loading.tsx` bajo `app/(admin)/(portal)/contenido/[type]/[id]/`
- Organismos `ContentEditor`, `SeoBlock`, `BodyEditor`, `RelationsPicker`, `PreviewPane` en `components/organisms/admin/cms/`
- Adaptadores form-state → props de plantilla para **servicio**, **geo_zone**, **case_study** y **blog_post** (`lib/cms/preview/`)
- Tipos restantes: formulario CRUD + SEO/cuerpo donde aplique; vista previa fiel **no** en esta entrega (mensaje informativo)
- Editor de cuerpo: **HTML en textarea** + sanitización en vista previa (`sanitizeCmsHtml`); sin nueva dependencia WYSIWYG
- Tests Vitest de adaptadores; E2E Playwright (servicio, SEO, preview, slug 409, 403 técnico)
- **Fuera:** transiciones de workflow (GTK-75), UI IA (GTK-74), capa `templates/**` documentada pero no creada

## Stitch (comentario Linear 2026-07-20)

Proyecto [Geoteknius — Portal Admin](https://stitch.withgoogle.com/projects/14512274866174259595), design system `assets/12797274562027555828`:

| Pantalla | Screen ID |
|----------|-----------|
| Editor completo | `3545a2cd5b5f4bc28a4914196618e4f3` |
| Nuevo contenido | `e564b5c724eb4c26aef45ab9dea61605` |
| Errores validación | `4c92a5aaf92846189a02ca45ae20f157` |
| Skeleton | `916a19c30f324135a3abec4bc22ca33f` |
| Guardando | `ba0080dde7db435eabbd3cf25e401369` |

Split-view editor/preview; contadores SEO; relaciones M:N (servicio↔zona en esta entrega); `alt_text` en media vía validación backend existente.

## Impacto

Sin cambios en `api-spec.yml`. Permisos `content.read` / `content.create` / `content.update` existentes.
