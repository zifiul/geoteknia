# Proposal — gtk-50-catalogo-casos

> US: [GTK-50 — Catálogo de casos de estudio con filtros](https://linear.app/geoteknia/issue/GTK-50/catalogo-de-casos-de-estudio-con-filtros-servicio-tipologia-provincia)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` — `/proyectos` desktop `9e71e9f124ba41e78c1c9c3838a4bb28`, mobile `4920741798904b4aaeb4bb4c81e91302`, vacío showcase `c0fdd28193c24d748d565f2844d93dfa`.
> Dependencias: GTK-41, GTK-47, GTK-78 Fase 1 (Done).

## Why

P2 necesita comprobar solvencia en condiciones similares antes de convertir. El catálogo `/proyectos` materializa RF-03/US-06 con filtros en URL, paginación indexable y variantes filtradas `noindex`, consumiendo la capa SEO GTK-78 sin reimplementarla.

## What Changes

- Ruta RSC `app/(public)/proyectos/page.tsx` con `searchParams`, metadata (`buildListingCanonical`, `resolveListingRobots`), `PaginationLinks`, JSON-LD `BreadcrumbList`.
- Lecturas `listPublishedCaseStudiesCatalog`, `listOperationalProvinces`, `listWorkTypologies`, `listPublishedCaseStudyProjectYears`.
- Organismos `CaseFilters`, `CaseCard`, `CasesPagination`, estado vacío, tracking engagement vía `pushRawDataLayer` (`view_item_list`, `filter_use`, `select_item`).
- Tests Vitest + E2E Playwright.

## Capabilities

### New

- `public-case-study-catalog`: listado filtrable y paginado de casos publicados.

### Modified

- Ninguna spec viva obligatoria fuera del delta del change.

## Impact

- **Contrato API:** omitido (sin Route Handlers).
- **Sequenciación:** enlaces a `/proyectos/[slug]` pendientes de GTK-53.
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

Detalle de caso GTK-53, GTK-78 Fase 2 de verificación integrada, Lighthouse CI GTK-77.
