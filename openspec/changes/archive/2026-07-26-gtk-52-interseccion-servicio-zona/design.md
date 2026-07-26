# Design — gtk-52-interseccion-servicio-zona

## UI (Stitch)

Mobile-first alineado con pantallas «Estudios geotécnicos» Madrid/Valencia/Sevilla (Stitch 2026-07-19, IDs en comentario Linear): hero con imagen LCP del servicio (`priority`), breadcrumbs `service_zone_page`, eyebrow con `targetKeyword`, bloque editorial del `body` de la intersección, tarjetas de enlace al servicio pillar y geo-landing, CTA presupuesto con `StickyCtaBar` en móvil. Tokens `brand-*`, `font-display`, secciones `bg-brand-surface` / `bg-brand-neutral/50` como GTK-49/GTK-51.

## Datos

- `getPublishedServiceZonePageBySlugs(serviceSlug, zoneSlug)` — resuelve servicio y zona publicados, luego `service_zone_page` publicada; incluye SEO, `body`, `targetKeyword`, hero del servicio y provincia de la zona.
- `listPublishedServiceZonePageStaticParams()` — pares `{ slug, zona }` para `generateStaticParams`.
- JSON-LD: `buildServiceSchema` con `areaServed: [zone.name]` y URL de intersección; proveedor vía `getOrganizationProfile`.

## SEO

- Metadata: `buildMetadata(siteUrl, 'service_zone_page', seoBlock, { siloExtra: { serviceSlug, zoneSlug }, ogImageUrl })`.
- Sin cambios en `lib/seo/canonical.ts` (listados paginados únicamente).

## Threat model

### Superficie de ataque
- RSC pública `/servicios/[slug]/[zona]` (solo lectura).
- Parámetros de ruta `slug` y `zona` (strings).
- CTAs con query `servicio` / `provincia` (slugs públicos).

### Actores
- Anónimo, bots de indexación. Sin auth en esta plantilla.

### Datos sensibles
- No PII nueva; contenido editorial ya publicable en CMS. Sin datos de leads en página.

### Amenazas identificadas
| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Enumeración de borradores | Adivinar slugs | Bajo | `PUBLISHED_EDITORIAL_WHERE`; `notFound()` uniforme |
| T2 | XSS en body CMS | HTML en body | Medio | Solo texto con `whitespace-pre-line`; sin `dangerouslySetInnerHTML` |
| T3 | Open redirect en CTAs | URL manipulada | Bajo | Hrefs internas fijas + `buildPresupuestoHref` |

### Requisitos de seguridad (criterios de aceptación verificables)
- [ ] SEC-1: Combinación no publicada devuelve 404 sin filtrar existencia de servicio/zona por mensajes distintos.
- [ ] SEC-2: El body de intersección se renderiza como texto escapado (sin HTML crudo).
- [ ] SEC-3: Eventos de analítica no incluyen PII (solo slugs canónicos).

Amenazas descartadas: RBAC (no `/admin`), rate limit HTTP (solo GET estático), Turnstile (sin formulario en página).
