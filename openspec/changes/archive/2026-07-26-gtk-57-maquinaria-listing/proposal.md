# Proposal — gtk-57-maquinaria-listing

> US: [GTK-57 — Página de equipamiento y maquinaria](https://linear.app/geoteknia/issue/GTK-57/pagina-de-equipamiento-y-maquinaria)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/maquinaria` desktop `2a98f5a80c624d04a7906b70e445d999`, mobile `bed0f665709a40ae9f7c3130e34c56da`.
> Dependencias: GTK-47, GTK-41, GTK-49 (cerradas). Reutiliza `listMachineryByService()` en servicios sin modificarla.

## Why

La página `/maquinaria` demuestra capacidad operativa (sondas, ensayos in situ, laboratorio ENAC por equipo, vehículos) y enlaza al silo de servicios (RF-07, RF-01), reduciendo objeciones técnicas antes del contacto.

## What Changes

- Ruta RSC `app/(public)/maquinaria/page.tsx` (SSG + ISR), metadata estática, canonical fijo `/maquinaria`, JSON-LD `BreadcrumbList` manual (`Inicio > Maquinaria`).
- Lectura `listPublishedMachinery()` con ficha técnica completa y servicios vinculados en la misma consulta.
- Contrato tipado `inSituTests` en `lib/content/schemas/` (deja de ser `z.unknown()` en CRUD).
- Organismos `MachineCard`, `SpecTable`, estado vacío, tracking `select_content` (servicios) y `scroll_depth`.
- Tests Vitest + E2E Playwright.

## Capabilities

### New Capabilities

- `public-machinery-listing`: listado público de equipos publicados con specs y enlaces a servicios.

### Modified Capabilities

- Ninguna spec viva fuera del delta del change.

## Impact

- **Contrato API:** omitido (sin Route Handlers ni Server Actions nuevas).
- **SEO:** sin paginación ni `searchParams`; no requiere utilidades GTK-78.
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

- Fichas individuales `/maquinaria/[slug]` (modelo listo; ticket de 2 puntos = solo listado).
- Acreditaciones corporativas ENAC (`GTK-59`); `has_enac_lab` es campo del equipo.
- Lighthouse CI formal (`GTK-77`).
