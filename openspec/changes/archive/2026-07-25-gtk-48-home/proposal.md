# Proposal — gtk-48-home

> US: [GTK-48 — Home con propuesta de valor, recorridos por persona y schema LocalBusiness](https://linear.app/geoteknia/issue/GTK-48/home-con-propuesta-de-valor-recorridos-por-persona-y-schema)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237`, pantallas `/` desktop `f232ff397d694a679681dc13eee48306`, mobile `e7736079382e4897882b1a79dbc7b24c`.
> Dependencias: GTK-41, GTK-45, GTK-46, GTK-47 (Done).

## Why

La home es el punto de entrada de marca y campañas no segmentadas. Debe orientar buyer personas (P1 técnico/promotor, P2 obra local, P3 licitaciones), mostrar servicios y prueba social solo publicados, y emitir JSON-LD `ProfessionalService`/`LocalBusiness` extendido (RF-09) sin duplicar builders ni filtros de CMS.

## What Changes

- Sustituir placeholder `app/(public)/page.tsx` por home RSC (SSG + ISR) alineada a Stitch y `docs/design/DESIGN.md`.
- Organismos `components/organisms/home/*` (Hero, PersonaPaths, ServicesGrid, TrustSignals, CtaSection).
- Extender `buildLocalBusinessSchema()` y `getOrganizationProfile()`; lecturas públicas `listPublishedServices`, `listRecentPublishedCaseStudies`, `listActiveAccreditations` (filtro `workflowStatus: publicado` como `sitemap-sources`).
- Metadata propia de home (sin `buildMetadata()`); canonical `/` vía `resolveMetadataBase`.
- Tracking: conversión en tel/WA/email; `select_content` en dataLayer para CTAs de silo (sin mirror `/api/eventos`).
- Tests Vitest + E2E Playwright; revalidación de `/` al publicar contenido destacado.

## Capabilities

### New Capabilities

- `public-home-page`: plantilla de inicio, JSON-LD LocalBusiness extendido, recorridos por persona.

### Modified Capabilities

- `seo-utilities`: extensión de `buildLocalBusinessSchema` (NAP, `areaServed`, `hasOfferCatalog`).

## Impact

- **API / contrato:** sin Route Handlers nuevos — **fase 2 omitida**.
- **Negocio pendiente:** `aggregateRating` sin `reviewCount` fiable (omitir bloque); casos destacados por recencia (sin `is_featured`).
- **QA:** E2E obligatorio (label `Frontend`, no `Backend`).

## Fuera de alcance

GTK-66 (presupuesto), plantillas destino GTK-49/51/59, migración `is_featured`, Lighthouse CI gate GTK-77.
