# Design — gtk-49-plantilla-servicio

## UI (Stitch)

Mobile-first; hero con imagen LCP (`priority`), breadcrumbs, bloques H2 (definición, metodología numerada, normativa con scroll horizontal, equipamiento en grid, entregables, FAQs, casos, cobertura geo), barra CTA sticky móvil (`StickyCtaBar`). Tokens `brand-*` y tipografía `font-display` como Home GTK-48.

## Datos

- `getPublishedServiceBySlug` + lecturas paralelas por `serviceId`.
- `areaServed` en JSON-LD desde nombres de zonas de `service_zone_pages` publicadas (no `service_zone_coverage`).
- Maquinaria: `PUBLISHED_EDITORIAL_WHERE` sobre `machinery` (modelo con bloque editorial).

## Threat model

| Superficie | Riesgo | Mitigación |
|---|---|---|
| RSC pública por slug | Enumeración de borradores | `PUBLISHED_EDITORIAL_WHERE`; `notFound()` sin filtrar estado |
| JSON-LD / body CMS | XSS en HTML | `JsonLd` escapado; body como texto con saltos (sin `dangerouslySetInnerHTML` salvo futuro sanitizador) |
| CTAs presupuesto/WA | PII en URL | Solo slug público; sin datos de lead en query |
| Analytics | PII en eventos | `serviceSlug` canónico; presupuesto fuera de `/api/eventos` |
| ISR | Contenido despublicado en caché | GTK-40 `revalidatePublishedContent` — verificar con test unitario existente del change |

## Decisiones

- Loader `lib/service/load-service-page.ts` agrupa queries (patrón `load-home-page`).
- `serviceType` en schema: nombre del servicio salvo campo futuro en CMS.
