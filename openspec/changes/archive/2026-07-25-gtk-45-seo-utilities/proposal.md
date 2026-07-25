# Proposal — gtk-45-seo-utilities

> US: [GTK-45 — Utilidades SEO: helpers JSON-LD, Metadata API y canonical](https://linear.app/geoteknia/issue/GTK-45/utilidades-seo-helpers-json-ld-metadata-api-y-canonical)
> Dependencias: GTK-43 (Done). Bloquea GTK-47, GTK-48–49, GTK-51, GTK-53, GTK-55–56, GTK-59–60, GTK-62, GTK-78.

## Why

El SEO es producto en Geoteknia: cada plantilla pública necesita JSON-LD tipado, canonical absoluto y Metadata API coherente. GTK-43 y GTK-42 dejaron `resolveMetadataBase`, `resolveContentUrl` y silos en `lib/seo/`, pero no hay builders Schema.org, ni `buildMetadata()`, ni componente RSC `<JsonLd>`. Sin centralizar esto, las plantillas futuras duplicarían lógica y romperían RNF-SEO.

## What Changes

- `lib/seo/jsonld.ts` — builders tipados por `SchemaType` (Prisma): `Service`, `LocalBusiness`/`ProfessionalService`, `Article`/`CreativeWork`, `Person`, `Organization`/`hasCredential`, `FAQPage`, `BreadcrumbList`.
- `lib/seo/metadata.ts` — `buildMetadata()` desde Bloque SEO + `resolveMetadataBase` + `resolveContentUrl` (sin reimplementar URLs).
- `lib/seo/breadcrumbs.ts` — datos `BreadcrumbList` sobre `buildSiloPath` / `sitemap-config` kinds.
- `lib/seo/json-ld-escape.ts` — escapado seguro para `<script type="application/ld+json">` (distinto de `escapeXml`).
- `components/seo/json-ld.tsx` — RSC que serializa e inyecta un único `<script>` por bloque (sin `'use client'`).
- Página de prueba pública mínima para E2E (canonical + JSON-LD + payload con `</script>`).
- Tests Vitest en `tests/unit/seo/` (builders, metadata, breadcrumbs, escape) y E2E Playwright (label `Frontend` + `CHORE`).

## Capabilities

### New Capabilities

- `seo-utilities`: helpers JSON-LD, Metadata API, breadcrumbs de silo, escapado seguro y componente `<JsonLd>` RSC reutilizable por plantillas.

### Modified Capabilities

- _(ninguna — `public-front-scaffolding` y `dynamic-sitemap-robots` no cambian requisitos; solo se consumen helpers existentes)_

## Impact

- **Código:** `lib/seo/*.ts`, `components/seo/json-ld.tsx`, página de prueba en `app/(public)/`, tests unitarios y E2E.
- **API / contrato:** sin Route Handlers ni Server Actions — **fase 2 del harness omitida**.
- **SEO:** materializa RNF-SEO; base para RF-01..RF-16 en tickets de plantilla.
- **RGPD/PII:** JSON-LD solo datos publicables del CMS; sin PII de leads en schema.
- **Rendimiento:** JSON-LD en SSR/SSG sin JS de cliente adicional (INP).

## Fuera de alcance

- Consumo en plantillas Home/Servicio/Zona/Caso/Blog/Equipo/Acreditaciones/FAQ (GTK-48–56, GTK-59, GTK-62).
- Breadcrumbs visuales en header (GTK-47 consume datos de `breadcrumbs.ts`).
- Indexabilidad transversal y paginación (GTK-78).
- Formularios CRUD de campos SEO en admin (GTK-41).
