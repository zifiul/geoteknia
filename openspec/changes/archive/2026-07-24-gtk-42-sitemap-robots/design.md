# Design — gtk-42-sitemap-robots

> US: [GTK-42](https://linear.app/geoteknia/issue/GTK-42/sitemap-xml-dinamico-sitemap-de-imagenes-y-robotstxt)

## Context

GTK-26 creó `app/robots.ts` con `Disallow` de `/admin`. No existe `lib/seo/` ni `app/sitemap.ts`. El frontend público aún no existe; las URLs se construyen desde patrones PRD §8 centralizados en `buildSiloUrl`. GTK-40 no está implementado: revalidación on-demand queda como contrato exportado + ISR 1h.

## Goals / Non-Goals

**Goals:**

- Sitemap principal vía Metadata API (`app/sitemap.ts`).
- Sitemap imágenes en Route Handler manual (`image:` namespace).
- Fuentes Prisma acotadas (`select` mínimo) y tolerancia a fallos parciales (log + entradas vacías, no 500).
- `NEXT_PUBLIC_SITE_URL` como base única.
- Tests unitarios (fuentes + `buildSiloUrl`) e integración de rutas.

**Non-Goals:**

- UI admin, mutaciones, Zod de input usuario.
- E2E Playwright (label `Backend`; sin páginas públicas).
- Incluir acreditaciones sin slug dedicado (solo listado institucional futuro).

## Decisions

### D1 — Patrones de URL (`buildSiloUrl`)

| Kind | Patrón |
|------|--------|
| service | `/servicios/{slug}` |
| geo_zone | `/zonas/{slug}` |
| service_zone_page | `/servicios/{serviceSlug}/{zoneSlug}` |
| case_study | `/proyectos/{slug}` |
| blog_post | `/blog/{categorySlug}/{slug}` |
| team_member | `/equipo/{slug}` |
| machinery | `/maquinaria/{slug}` |
| faq_group | `/faqs/{slug}` |

URLs absolutas: `` `${siteUrl}${path}` `` (sin barra duplicada).

### D2 — Prioridad / frecuencia (Hallazgo 8)

Congelado en tabla de la delta spec.

### D3 — GTK-40

`lib/seo/sitemap-config.ts`:

- `SITEMAP_CACHE_TAG = 'sitemap'`
- `SITEMAP_REVALIDATE_SECONDS = 3600`
- `app/sitemap.ts` y `sitemap-imagenes/route.ts` exportan `revalidate = 3600` y `unstable_cache` con tag `sitemap` donde aplique.

### D4 — Imágenes polimórficas

`content_media.content_type` alineado con `EditorialContentType` + extensiones (`team_member`, `machinery`, `faq_group`). Función `isOwnerIndexable(type, id)` consulta la tabla correspondiente.

### D5 — robots.ts

Importar `env` desde `lib/env` (ruta server). Añadir `sitemap` al objeto `MetadataRoute.Robots`. Thank-you/filtros: se añadirán cuando existan rutas (comentario GTK-26).

### D6 — Contrato fase 2

**Omitida** — endpoints públicos GET sin body; sin RBAC ni rate limit adicional (lectura idempotente, datos ya públicos al publicar).

## Risks / Trade-offs

- **URLs sin página real** hasta frontend → mitigación: `buildSiloUrl` único; E2E diferido.
- **Consulta N+1 en imágenes** → mitigación: batch por `content_type` o join acotado; volumen PRD <200 URLs.
- **Fallo Prisma** → mitigación: try/catch por fuente, log estructurado sin PII, respuesta parcial.

## Threat model

### Superficie de ataque

- `GET /sitemap.xml`, `GET /sitemap-imagenes`, `GET /robots.txt` — públicos, sin auth.
- Sin parámetros de usuario.

### Actores

- Crawlers y atacantes anónimos (solo lectura).

### Datos sensibles

- Solo URLs y metadatos de contenido ya publicable; **nunca** leads/contacts/PII en XML o logs.

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Fuga de borradores en sitemap | Filtro `publicado` + `!noindex` |
| T2 | Inclusión `/admin` | No se consultan rutas admin; robots Disallow |
| T3 | XXE / inyección en XML | Escapar `&`, `<`, `>` en textos dinámicos; sin input externo |
| T4 | DoS por consultas pesadas | `select` acotado, ISR, índices existentes |
| T5 | Enumeración de borradores vía timing | Misma respuesta 200 con conjunto vacío parcial |

**Descartadas:** RBAC (público por diseño), Turnstile (sin formulario).

### Requisitos de seguridad (SEC)

- **SEC-1:** Sitemap no contiene subcadena `/admin` en URLs generadas.
- **SEC-2:** Logs de error de sitemap no incluyen emails ni datos de leads.
- **SEC-3:** XML de imágenes escapa caracteres especiales en caption/loc.

## Open Questions

- URL definitiva de acreditaciones individuales (fuera de MVP sitemap).
- Páginas thank-you en `Disallow` cuando GTK-28+ las cree.
