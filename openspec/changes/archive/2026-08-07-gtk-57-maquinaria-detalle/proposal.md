# Proposal — gtk-57-maquinaria-detalle

> US: Extensión de [GTK-57 — Página de equipamiento y maquinaria](https://linear.app/geoteknia/issue/GTK-57/pagina-de-equipamiento-y-maquinaria)
> Dependencias: GTK-57 (listado `/maquinaria`, cerrado). Sin migración Prisma.

## Why

GTK-57 dejó fuera de alcance las fichas `/maquinaria/[slug]`, pero el sitemap y la revalidación ya emiten esas URLs, que hoy devuelven 404. Completar la ficha individual cierra la incoherencia SEO y permite enlazar desde el listado y desde servicios.

## What Changes

- Ruta RSC `app/(public)/maquinaria/[slug]/page.tsx` (SSG + ISR `revalidate = 3600`).
- `getPublishedMachineryBySlug()` en `lib/content/machinery.ts` (refactor compartido con `listPublishedMachinery()`).
- SEO sintético `buildMachinerySeoBlock()` (sin bloque SEO en BD).
- JSON-LD `Product` + `BreadcrumbList`.
- Organismo `MachineDetail`; enlaces en `MachineCard` y `ServiceEquipment`.
- Revalidación de `/maquinaria` al publicar un equipo.

## Capabilities

### New Capabilities

- `public-machinery-detail`: ficha pública por slug con specs, servicios vinculados y metadata sintética.

### Modified Capabilities

- `public-machinery-listing`: las fichas del listado enlazan al detalle.

## Impact

- **Contrato API:** omitido (solo lectura pública).
- **Sin migración** de schema ni CMS.

## Fuera de alcance

- Campo descripción/cuerpo o bloque SEO editable en CMS.
- Acreditaciones corporativas (`GTK-59`).
