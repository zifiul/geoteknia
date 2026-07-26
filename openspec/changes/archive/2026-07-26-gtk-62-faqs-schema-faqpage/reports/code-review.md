# Code review — gtk-62-faqs-schema-faqpage

**Fecha:** 2026-07-26  
**Alcance:** lectores FAQ generales, rutas `/faqs`, `FaqAccordion`, integración servicio.

## Checklist

- [x] Reutiliza `Accordion.tsx` y `buildFaqPageSchema()` sin duplicar.
- [x] Sin FAQs publicadas → `null`/vacío; sin JSON-LD vacío.
- [x] Metadata y canonical alineados con silo `faq_group`.
- [x] `server-only` en capa de datos; Client Component acotado al acordeón.
- [x] Threat model GTK-62 cubierto (slug vía Prisma, XSS, SEO).
- [x] `reports/security.md` limpio.

## Seguridad

Sin hallazgos bloqueantes (ver security scan).

## Observaciones menores

- E2E de servicio/FAQPage depende de datos semilla en el entorno (skip aceptable).

**Veredicto: APTO**
