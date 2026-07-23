# Code Review — GTK-15 FAQs, lead magnets y reglas de la calculadora

**Fecha:** 2026-07-23  
**Change:** `gtk-15-faqs-lead-magnets-calculator-rules`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — enum `FaqScope`, modelos `FaqGroup`, `Faq`, `LeadMagnet`, `CalculatorRule` y back-relations
- `prisma/migrations/20260723052313_faqs_lead_magnets_calculator_rules/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PKs | ✅ |
| Modelos alineados con `data-model.md` §4.7 | ✅ |
| Bloques SEO/EDITORIAL/AUDIT según entidad | ✅ |
| `workflow_status` default `borrador_ia` en `faqs` y `lead_magnets` | ✅ |
| Slugs únicos en `faq_groups` y `lead_magnets` | ✅ |
| `is_gated` default `true` en `lead_magnets` | ✅ |
| `thank_you_url` NOT NULL en `lead_magnets` | ✅ |
| `boreholes_formula` JSON NOT NULL en `calculator_rules` | ✅ |
| `is_active` default `true` en `calculator_rules` | ✅ |
| FK cascade `faqs` → `faq_groups` | ✅ |
| FK set null en referencias opcionales a `services` | ✅ |
| Índice compuesto `(work_typology_id, is_active)` | ✅ |
| Sin seed en este ticket (DB-14) | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.

Veredicto: APTO
