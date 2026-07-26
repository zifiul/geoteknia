# Code review — gtk-57-maquinaria-listing

- Fecha: 2026-07-26
- US: GTK-57

## Checklist

- [x] `listMachineryByService()` sin cambios de contrato (GTK-49).
- [x] `listPublishedMachinery()` con `PUBLISHED_EDITORIAL_WHERE`, foto batch y servicios publicados en join.
- [x] `inSituTests` tipado (`machinery-in-situ-tests.ts`) en CRUD y lectura pública.
- [x] SEO: canonical fijo, breadcrumbs + JSON-LD, metadata estática.
- [x] UI Stitch: hero «Capacidad operativa», grid 1/2/3, fichas con imagen y specs.
- [x] Tests unitarios (4) y E2E (3) en verde tras `next build`.
- [x] `reports/security.md` sin bloqueantes.

## Seguridad

- Parser tolerante de JSON evita 500 por datos CMS corruptos.
- Analytics: `select_content` sin mirror; `scroll_depth` canónico.

## Observaciones menores

- E2E requiere build actualizado (`next start` en puerto 3010); reutilizar servidor obsoleto devuelve 404.
- Fichas `/maquinaria/[slug]` fuera de alcance (documentado).

Veredicto: APTO
