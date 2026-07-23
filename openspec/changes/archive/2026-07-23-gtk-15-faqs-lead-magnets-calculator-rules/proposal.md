# Proposal — gtk-15-faqs-lead-magnets-calculator-rules

> US: [GTK-15 — FAQs, lead magnets y reglas de la calculadora](https://linear.app/geoteknia/issue/GTK-15/faqs-lead-magnets-y-reglas-de-la-calculadora)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9, GTK-10, GTK-16, GTK-18, GTK-20 | Desbloquea: GTK-13

## Why

Las entidades de conversión y soporte SEO de cola larga — `faq_groups`, `faqs`, `lead_magnets` y `calculator_rules` — aportan datos estructurados `FAQPage`, captación gated de leads y reglas configurables de la calculadora de alcance CTE. Materializa RF-16, RF-11 y RF-Q1, entidades 14, 15, 16 y 18 del modelo.

## What Changes

- Crear enum `FaqScope`.
- Crear modelos `FaqGroup`, `Faq`, `LeadMagnet` y `CalculatorRule` con bloques SEO/EDITORIAL/AUDIT según entidad.
- Añadir back-relations `faqGroups` y `leadMagnets` en `Service`; `calculatorRules` en `WorkTypology`.
- Migración `faqs_lead_magnets_calculator_rules` (DDL-only, sin data migration).
- Seed de `calculator_rules` pendiente de DB-14 (tabla CTE validada por dirección técnica).

## Capabilities

### New Capabilities

- `faqs-lead-magnets-calculator-rules`: FAQs agrupadas, recursos gated y reglas de calculadora por tipología.

### Modified Capabilities

- `services-geo-zones-intersection`: back-relations `faqGroups` y `leadMagnets` en `Service`.
- `master-provinces-work-typologies`: back-relation `calculatorRules` en `WorkTypology`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** cuatro tablas + enum en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII en estas entidades; descargas con datos de contacto se registran en `leads` (DB-11).
- **Tickets desbloqueados:** GTK-13.

## Fuera de alcance

- Relación `lead_magnets` 1:N `leads` (DB-11).
- Seed de reglas CTE (DB-14).
- Lógica de dominio en `/lib/`.
