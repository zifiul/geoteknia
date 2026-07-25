# Design — gtk-50-catalogo-casos

## Enfoque

- **Datos:** RSC lee `searchParams`; `CaseFilters` (client) solo navega con `router.push`. Filtros `servicio`, `tipologia`, `provincia`, `ano`; página `page`. Slugs/año inválidos se ignoran en `buildCaseCatalogWhere`.
- **SEO:** `CASE_CATALOG_FILTER_KEYS` alineado con GTK-78; `generateMetadata` usa utilidades existentes; `rel=prev/next` en `<PaginationLinks />`.
- **UI:** Hero + sidebar filtros (desktop) / acordeón (mobile) según Stitch; grid 1/2/3 columnas; tarjetas con imagen `og`, chips de servicio/tipología/provincia/año y volumen.
- **Analytics:** eventos GA4 de listado por `pushRawDataLayer`, sin `/api/eventos`.

## Threat model (GTK-50)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Entrada URL | Inyección/reflejo en query | Sin HTML desde params; solo slugs resueltos en servidor |
| Enumeración | Filtrado revela existencia de slugs | Slugs inválidos ignorados; sin 404 por filtro |
| PII | `clientName` en casos | No exponer en listado; solo campos públicos del select |
| SEO | Indexación de combinaciones finas | `noindex` con filtros activos; canonical limpio |
| XSS | Títulos CMS en tarjetas | React escape por defecto; sin `dangerouslySetInnerHTML` |

## Decisiones

- `CASE_CATALOG_PAGE_SIZE = 12`.
- Años del `<select>` desde `listPublishedCaseStudyProjectYears()` con fallback de últimos 8 años.
- Imagen de tarjeta: `ogImageId` del caso.

## Integración GTK-78

Consumo documentado en `lib/seo/canonical.ts` — sin cambios en módulos SEO transversales.
