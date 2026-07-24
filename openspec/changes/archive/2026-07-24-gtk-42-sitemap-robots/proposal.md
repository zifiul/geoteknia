# Proposal — gtk-42-sitemap-robots

> US: [GTK-42 — Sitemap XML dinámico, sitemap de imágenes y robots.txt](https://linear.app/geoteknia/issue/GTK-42/sitemap-xml-dinamico-sitemap-de-imagenes-y-robotstxt)
> Labels: `Backend`, `Feature` | Dependencias: GTK-26 (`app/robots.ts`), modelos SEO/EDITORIAL en Prisma | Desbloquea: GTK-40 (punto de revalidación), frontend público (`buildSiloUrl`)

## Why

Los buscadores necesitan descubrir solo URLs publicadas e indexables (silos servicio×zona×casos×blog) y un sitemap de imágenes acotado. `robots.txt` debe referenciar el sitemap y mantener el aislamiento de `/admin`. Materializa RF-13 y RNF-SEO sin exponer borradores ni PII.

## What Changes

- `lib/seo/silo-urls.ts` — patrones canónicos de URL pública por tipo de entidad.
- `lib/seo/sitemap-sources.ts` — consultas Prisma indexables + join polimórfico para imágenes.
- `lib/seo/sitemap-config.ts` — ISR (1h), tag `sitemap` para GTK-40.
- `app/sitemap.ts` — MetadataRoute.Sitemap con prioridad/frecuencia por tipo.
- `app/sitemap-imagenes/route.ts` — XML manual namespace `image:`.
- Extender `app/robots.ts` — línea `Sitemap:` con `NEXT_PUBLIC_SITE_URL`.
- `lib/env.ts` + `.env.example` — `NEXT_PUBLIC_SITE_URL`.
- Tests unitarios + integración HTTP; curl en QA; **E2E omitido** (label `Backend`; sin resolución de páginas públicas aún).

## Capabilities

### New Capabilities

- `dynamic-sitemap-robots`: generación dinámica de sitemap principal, sitemap de imágenes y extensión de robots.

### Modified Capabilities

- `env-validation`: `NEXT_PUBLIC_SITE_URL`.

## Impact

- **Código:** `lib/seo/*`, `app/sitemap.ts`, `app/sitemap-imagenes/route.ts`, `app/robots.ts`, `lib/env.ts`, estándares backend/frontend.
- **BD:** solo lectura; sin migración.
- **API:** Route Handler público `GET /sitemap-imagenes` (XML); fase contrato omitida (sin input Zod ni mutaciones).
- **GTK-40:** consumirá `SITEMAP_CACHE_TAG` / `revalidateTag('sitemap')`; hasta entonces ISR 3600s.

## Fuera de alcance

- Revalidación on-demand al publicar (GTK-40).
- Páginas públicas Next (`app/(public)/`) y E2E de resolución de URLs.
- Sitemap index (>50k URLs).
