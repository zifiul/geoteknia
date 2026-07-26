# Design — gtk-62-faqs-schema-faqpage

## Enfoque

- **Datos:** `listPublishedGeneralFaqGroups()` — `scope: general`, `deletedAt: null`, al menos una FAQ con `PUBLISHED_EDITORIAL_WHERE`. `getPublishedFaqGroupBySlug(slug)` devuelve `null` si el grupo no existe o no tiene FAQs publicadas (no schema vacío).
- **SEO:** metadata derivada de `name` del grupo; `canonical` con `buildSiloPath('faq_group', { slug })`; `robots: index,follow`. `FAQPage` + `BreadcrumbList` en `/faqs/[slug]`; índice solo breadcrumb.
- **UI (Stitch):** hero editorial en `/faqs` (eyebrow + H1 + lead), grid de tarjetas a grupos; detalle con hero del grupo y acordeón a ancho completo sobre fondo neutro.
- **Acordeón:** Radix vía `Accordion.tsx`; respuestas siempre montadas en DOM; hash `#faq-{uuid}` abre el ítem al cargar; objetivos táctiles heredados del trigger.
- **Servicios:** `ServiceFaqs` delega en `FaqAccordion`; JSON-LD en `servicios/[slug]/page.tsx` sin cambios de contrato.

## Threat model (GTK-62)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Entrada URL | Slug de grupo malicioso | Resolución solo vía Prisma; `notFound()` si null |
| XSS | Pregunta/respuesta CMS | React escape; sin `dangerouslySetInnerHTML` |
| Open redirect | `internal_link_url` | URLs almacenadas en CMS; enlaces relativos o mismo sitio en contenido editorial |
| SEO | Schema vacío | No renderizar bloque ni JSON-LD si cero FAQs publicadas |
| PII | — | Sin datos personales en FAQs públicas |

## Decisiones

- Anclas: `#faq-{id}` (estable sin migración).
- `PublishedFaqItem` unifica servicio y general; `internalLinkUrl` expuesto en lectores.
- `lib/faq/catalog-config.ts` para metadata del índice (patrón GTK-57).

## Integración

- Reutilizar `buildFaqPageSchema`, `JsonLd`, `buildSiloBreadcrumbSegments`, GTK-40 ISR.
