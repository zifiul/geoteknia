# Proposal — gtk-53-detalle-caso-estudio

> US: [GTK-53 — Plantilla de detalle de caso de estudio](https://linear.app/geoteknia/issue/GTK-53/plantilla-de-detalle-de-caso-de-estudio-schema-articlecreativework)
> Diseño Stitch: proyecto `9787207935189076711`, DS `3480174961756698237` — `/proyectos/ampliacion-terminal-sur-valencia` desktop `38a20b5866b04edeb21c5216ead50ba0`, mobile `4777cbac8a094499b8f6c288060315eb`.
> Dependencias: GTK-50, GTK-41, GTK-40, GTK-56, GTK-45 (Done).

## Why

Detalle indexable `/proyectos/[slug]` con solvencia técnica (problemática, solución, volumen, galería, maquinaria, equipo firmante), JSON-LD `Article`/`CreativeWork` con localización y autores M:N, y CTA con preselección servicio+provincia.

## What Changes

- Lectores `getPublishedCaseStudyBySlug`, `listPublishedCaseStudySlugs`, `listContentMediaGallery` (genérico).
- Extensión `buildArticleSchema` / `buildCreativeWorkSchema` (`authors[]`, `location`).
- Ruta `app/(public)/proyectos/[slug]/page.tsx` + organismos Stitch en `components/organisms/cases/`.
- Extensión `BudgetCta` con `provinceSlug`; tracking `view_item`, `cta_click`, `scroll_depth`.
- Tests Vitest + E2E Playwright.

## Capabilities

### New

- `public-case-study-detail`: plantilla de detalle de caso publicado.

### Modified

- `lib/seo/jsonld.ts` (autores múltiples y `contentLocation`).

## Impact

- **Contrato API:** omitido (sin Route Handlers).
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

Formulario presupuesto funcional (GTK-66), editor CMS (GTK-73), gates Lighthouse GTK-76/77.
