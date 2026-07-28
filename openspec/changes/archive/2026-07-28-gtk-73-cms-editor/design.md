# Design — gtk-73-cms-editor

## Decisiones

### Alcance por tipo

| Tipo | Formulario | Vista previa fiel | Relaciones M:N |
|------|------------|-------------------|----------------|
| `service` | Completo (Stitch) | Sí (organisms servicio) | `zoneIds` |
| `geo_zone` | Campos principales + SEO + cuerpo | Sí (organisms geo) | — |
| `case_study` | Campos principales + SEO + cuerpo | Sí (organisms caso) | simplificado |
| `blog_post` | Campos principales + SEO + cuerpo HTML | Sí (ArticleBody, etc.) | simplificado |
| Resto | SEO + campos mínimos del schema CRUD | Mensaje “sin preview fiel” | según GTK-41 en iteración posterior |

### Cuerpo

Textarea HTML (`BodyEditor`) + preview sanitizada con `sanitizeCmsHtml` en cliente para la pestaña preview. Sin TipTap/Lexical (bundle y §10.2 frontend-standards).

### Composición UI (Stitch Oleada A4)

- Layout `lg:grid-cols-2`: panel formulario (tabs Campos / SEO / Relaciones) + `PreviewPane`
- Móvil: tabs “Editar” / “Vista previa”
- Estados: `loading.tsx` skeleton (`916a19c30f324135a3abec4bc22ca33f`), `aria-busy` al guardar (`ba0080dde7db435eabbd3cf25e401369`), `role="status"` al éxito, errores `role="alert"`

### Guardado

Client `ContentEditor`: `useTransition` + Server Actions de `contenido/actions.ts`; éxito → `router.refresh()`; create → `router.replace(meta.editorPath(newId))`. Sin `useEffect` para persistencia.

### Preview

`lib/cms/preview/*-adapter.ts` mapea `ServiceEditorFormState` (etc.) a `PublishedServiceDetail` (etc.) con URLs de media resueltas en servidor al cargar la página (`resolveMediaFileUrl`). Relacionados (FAQs, casos…) vacíos en preview de borrador.

### Carga RSC

`page.tsx` valida `type` con `editorialContentTypeSchema`, comprueba `can(session, 'content.read')`, carga entidad con helpers server-only o defaults para `nuevo`, pasa opciones de zonas para `RelationsPicker` en servicio.

## Threat model

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Acceso editor sin `content.read` | `runWithPortalReadAccess` + `can` → forbidden |
| T2 | Guardado sin `content.create`/`update` | `withPermission` en actions; UI deshabilitada |
| T3 | XSS en cuerpo HTML | `sanitizeCmsHtml` en preview; público ya sanitiza |
| T4 | IDOR lectura entidad | Actions exigen permiso; no exponer listados extra |
| T5 | Fuga PII | Solo contenido editorial; portal noindex |
| T6 | CSRF en actions | Server Actions + sesión Auth.js |

### Criterios seguridad

- [ ] SEC-1: página editor exige sesión portal y `content.read`
- [ ] SEC-2: mutaciones solo vía actions GTK-41 con RBAC
- [ ] SEC-3: preview no ejecuta scripts del HTML del usuario (sanitize)
- [ ] SEC-4: sin PII de leads en formulario
