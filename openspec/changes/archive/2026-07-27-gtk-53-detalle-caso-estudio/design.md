# Design — gtk-53-detalle-caso-estudio

## Enfoque

- **Datos:** `getPublishedCaseStudyBySlug` con `PUBLISHED_EDITORIAL_WHERE`; relaciones servicio, provincia, tipología, equipo (`case_study_team_members` con miembros publicados); `clientName` solo si `clientIsPublic`.
- **Galería:** `listContentMediaGallery(contentType, contentId)` en `media-assets.ts`; en detalle usar `contentType: 'case_study'` (alineado con `publish.ts` / sitemap).
- **Maquinaria:** `listMachineryByService(service.id)` — sin relación directa caso↔maquinaria.
- **JSON-LD:** `schemaType` del caso → `Article` o `CreativeWork`; `authors[]` con URL `/equipo/{slug}`; `contentLocation` si lat/long; `BreadcrumbList` vía `buildSiloBreadcrumbListSchema`.
- **UI Stitch:** hero con breadcrumbs y chips; métricas legibles; secciones editoriales; galería grid/carril móvil; bloque equipo; enlaces cruzados; `BudgetCta` + `StickyCtaBar` en móvil.

## Threat model (GTK-53)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| IDOR | Caso borrador / no publicado | `PUBLISHED_EDITORIAL_WHERE`; `notFound()` unificado |
| PII | Cliente no público | No exponer `clientName` si `clientIsPublic` es false |
| XSS | Textos CMS | Campos caso son texto; render como texto (no HTML crudo sin sanitizar) |
| Open redirect | CTA presupuesto | Solo query params codificados a `/presupuesto` |
| SEO | Contenido no indexable | `buildMetadata` + `noindex` del bloque SEO |

## Decisiones

- `revalidate = 3600` en la ruta.
- ISR on-demand ya cubierto por GTK-40 (`resolveRevalidationPaths` `case_study`) — verificar en test, no reimplementar.

## Reutilización

`buildMetadata`, breadcrumbs `case_study`, `BudgetCta`, `ServiceEquipment`, `buildSiloPath`, `getOrganizationProfile`, `listMachineryByService`.
