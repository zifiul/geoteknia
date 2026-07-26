# Design — gtk-56-equipo-tecnico

## Enfoque

- **Datos:** lectores en `lib/content/team-machinery.ts` y `listPublishedCaseStudiesByTeamMember` en `case-studies.ts` con `PUBLISHED_EDITORIAL_WHERE`; fotos vía `media_assets` (mismo patrón que servicios).
- **SEO ficha:** `buildTeamMemberSeoBlock()` deriva `metaTitle` (`fullName — jobTitle`), `metaDescription` (bio truncada 155), `schemaType: Person`, `noindex: false` fijo — documentada ausencia de bloque SEO/`noindex` en `team_members`.
- **JSON-LD:** `buildPersonSchema()` sin extender; `BreadcrumbList` con `buildSiloBreadcrumbListSchema` (`kind: team_member`).
- **UI Stitch:** hero con etiqueta de silo y grid 1/2/3 columnas en directorio; ficha con retrato (LCP `priority`), datos apilados en móvil, bloque proyectos oculto si lista vacía.
- **Colegiación (gap 5):** mostrar `collegeRegistrationNo` cuando exista — información profesional pública habitual; sin flag CMS.

## Threat model (GTK-56)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Enumeración | Slugs de borradores | Solo `PUBLISHED_EDITORIAL_WHERE`; 404 unificado |
| XSS | Bio/publicaciones CMS | React escape; sin `dangerouslySetInnerHTML` |
| PII | Colegiación, bio | Solo registros publicados; sin logs de PII |
| SEO | Fichas no indexables por error | `noindex: false` explícito; canonical vía `buildMetadata` |
| IDOR | Ficha no publicada | `getPublishedTeamMemberBySlug` → `notFound()` |

## Decisiones

- Orden directorio: `fullName` asc.
- `revalidate = 3600` en ambas rutas.
- Eventos GA4 de engagement directos al `dataLayer`, no `/api/eventos`.

## Reutilización

`buildPersonSchema`, `PUBLISHED_EDITORIAL_WHERE`, breadcrumbs `team_member`, patrón `listPublishedCaseStudiesByService`.
