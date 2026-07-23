# Informe — GTK-15 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-15-faqs-lead-magnets-calculator-rules`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 6/6 tests (env + db) |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma migrate dev --name faqs_lead_magnets_calculator_rules` | ✅ Migración creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con `FaqGroup`, `Faq`, `LeadMagnet`, `CalculatorRule` |

## Criterios de aceptación GTK-15

| Criterio | Estado |
|----------|--------|
| Enum `FaqScope` con valores `general` y `service` | ✅ |
| `faq_groups.slug` único | ✅ |
| `lead_magnets.slug` único | ✅ |
| `faqs` con bloque EDITORIAL (`workflow_status` default `borrador_ia`) | ✅ |
| `lead_magnets.is_gated` default `true` | ✅ |
| `lead_magnets.thank_you_url` obligatorio | ✅ |
| `calculator_rules.boreholes_formula` JSON NOT NULL | ✅ |
| `calculator_rules.is_active` default `true` | ✅ |
| Índice compuesto `(work_typology_id, is_active)` | ✅ |
| FK cascade `faqs` → `faq_groups` | ✅ |
| FK set null `faq_groups.service_id` y `lead_magnets.service_id` | ✅ |
| Back-relations en `Service` y `WorkTypology` | ✅ |
| Sin seed (pendiente DB-14) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
