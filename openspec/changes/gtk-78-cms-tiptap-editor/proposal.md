# Proposal — gtk-78-cms-tiptap-editor

## Why

Los campos editoriales `body` y `answer` del CMS admin se editan hoy con un `<textarea>` monoespaciado etiquetado como HTML, lo que dificulta el formato, aumenta errores de marcado y desalinea la experiencia con el render público (solo el blog interpretaba HTML de forma consistente).

## What Changes

- Sustituir `BodyEditor` por un editor TipTap headless con toolbar accesible en los 5 campos HTML del CMS (`service`, `geo_zone`, `service_zone_page`, `blog_post`, `faq`).
- Mantener el contrato de persistencia: columnas `String @db.Text` con HTML sanitizable.
- Adaptar el render público de servicios, zonas, intersección y FAQ para mostrar HTML sanitizado.
- Sanitizar la vista previa admin (corrige preview de blog sin sanitizar).
- Añadir preview de `service_zone_page` y `faq`.
- Script idempotente de migración de texto plano a HTML para contenido existente.
- Alinear la salida del panel IA (`buildBodyWithHeadings`) con HTML válido para TipTap.

## Capabilities

### Modified Capabilities

- `admin-cms-content-editor`: editor rich text TipTap, preview ampliada y sanitizada.
- `services-geo-zones-intersection`: render público de `body` como HTML sanitizado.
- `faqs-lead-magnets-calculator-rules`: render de `answer` como HTML sanitizado.

## Impact

- Dependencias MIT nuevas: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` y extensiones gratuitas.
- Bundle admin incrementado; sin impacto en rutas públicas medidas por Lighthouse CI.
- Tests E2E GTK-73 actualizados para `contenteditable`.

## Fuera de alcance

- Campos texto plano (`summary`, `excerpt`, `bio`, bloques SEO).
- `methodology` / `deliverables` (JSON estructurado).
- Migración de `ContentRevision.bodySnapshot` históricos.
- Extensiones TipTap de pago (Collaboration, AI, Comments).

## Linear

Sin ticket vinculado (solicitud directa de producto).
