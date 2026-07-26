# Proposal — gtk-62-faqs-schema-faqpage

> US: [GTK-62 — FAQs técnicas con schema FAQPage](https://linear.app/geoteknia/issue/GTK-62/faqs-tecnicas-con-schema-faqpage)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/faqs` desktop `2bb67d7168a8467697424a311ceff636`, mobile `d639b73066ed4cecbd6744d3e5fd5fc9`.
> Dependencias GTK-45, GTK-49, GTK-47, GTK-41 cerradas.

## Why

Resolver dudas técnicas antes del contacto (P1) y habilitar rich snippets con `FAQPage` JSON-LD. Materializa RF-16 y US-04: índice `/faqs`, página por grupo `/faqs/[slug]` (silo `faq_group` ya revalidado por GTK-40) y acordeón reutilizable en plantilla de servicio.

## What Changes

- Lectores `listPublishedGeneralFaqGroups()` y `getPublishedFaqGroupBySlug()` en `lib/content/blog-faqs.ts`.
- Rutas RSC `app/(public)/faqs/page.tsx` y `app/(public)/faqs/[slug]/page.tsx` (SSG + ISR).
- `FaqAccordion` (Client) componiendo `Accordion.tsx`; `ServiceFaqs` migrado al mismo componente.
- JSON-LD `FAQPage` vía `buildFaqPageSchema()` + `BreadcrumbList` en detalle; metadata directa (sin bloque SEO en `faq_groups`).
- Anclas estables `#faq-{id}` (sin migración de slug por pregunta).
- Tracking `faq_open` y `select_content` en enlaces internos (dataLayer, sin `/api/eventos`).

## Capabilities

### New

- `public-faq-pages`: índice y detalle de grupos FAQ generales + acordeón compartido con servicios.

### Modified

- Ninguna spec viva fuera del delta del change.

## Impact

- **Contrato API:** omitido (sin Route Handlers ni Server Actions nuevas).
- **QA:** E2E Playwright obligatorio (label `Frontend`).

## Fuera de alcance

- `slug` por fila `faqs`; auditoría WCAG formal (GTK-76/77).
