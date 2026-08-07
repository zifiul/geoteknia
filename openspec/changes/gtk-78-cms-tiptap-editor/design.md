# Design — gtk-78-cms-tiptap-editor

## Enfoque

TipTap headless en `BodyEditor` (client component) con extensiones acotadas al allowlist de `sanitizeCmsHtml`. Serialización HTML nativa (`editor.getHTML()` / `content` inicial) sin cambio de esquema Prisma.

## Reversión de decisión GTK-73

GTK-73 rechazó TipTap/Lexical por bundle (§10.2 frontend-standards). Se revierte porque:

- El editor solo se carga en rutas `(admin)` autenticadas y `noindex`.
- La web pública recibe strings HTML ya sanitizados; no importa ProseMirror.
- Lighthouse CI mide plantillas públicas, no el portal admin.

## Server vs Client

| Pieza | Capa |
|---|---|
| Páginas `/contenido/*` | RSC (sin cambio) |
| `BodyEditor`, `RichTextToolbar`, `PreviewPane` | Client |
| `GeoEditorialBody`, `IntersectionEditorialBody` | Server o client (sanitizer isomórfico) |
| `sanitizeCmsHtml` | Server-only (páginas RSC) |
| `sanitizeCmsHtmlClient` | Client (preview, FAQ accordion) |

## Threat model (XSS)

- **Entrada:** HTML generado por TipTap o IA; validación Zod sigue siendo `z.string().min(1)` sin confiar en el formato.
- **Almacenamiento:** texto en BD sin ejecutar.
- **Salida pública:** `sanitizeCmsHtml` / `sanitizeCmsHtmlClient` con allowlist DOMPurify antes de `dangerouslySetInnerHTML`.
- **Preview admin:** sanitizada en cliente (cierra agujero previo en blog preview).
- **JSON-LD FAQ:** `htmlToPlainText` antes de `buildFaqPageSchema`.

## Migración de datos

Script `scripts/gtk-78-plaintext-to-html.ts`: convierte `\n\n` → `<p>`, idempotente si ya es HTML. No toca `BlogPost.body`.

## Componentes Atomic Design

- `RichTextToolbar` → molécula
- `RichTextContent` → molécula (render HTML sanitizado)
- `BodyEditor` → organismo admin/cms (sin shadcn)
