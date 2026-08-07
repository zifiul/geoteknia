# Design — gtk-57-maquinaria-detalle

## Arquitectura

Patrón idéntico a `/equipo/[slug]`: RSC, `generateStaticParams` desde `listPublishedMachinery()`, `notFound()` si no publicado, metadata vía `buildMetadata` + bloque SEO sintético.

## Threat model

| ID | Riesgo | Mitigación |
|----|--------|------------|
| SEC-1 | Enumeración de borradores | `PUBLISHED_EDITORIAL_WHERE` en `getPublishedMachineryBySlug`; 404 genérico |
| SEC-2 | XSS en campos CMS | Escape React; `JsonLd` serializa JSON |
| SEC-3 | Servicios no publicados en ficha | Join filtra `service: PUBLISHED_EDITORIAL_WHERE` |
| SEC-4 | Superficie de ataque | GET público read-only, sin PII |

## JSON-LD Product

`buildProductSchema` con `additionalProperty` para specs técnicas (profundidad, diámetros, ensayos, ENAC). Sin `offers` ni precio.
