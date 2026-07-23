# Design — gtk-15-faqs-lead-magnets-calculator-rules

> Variante Harness DB — `faq_groups`, `faqs`, `lead_magnets`, `calculator_rules` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`FaqGroup`:** agrupación RF-16 con `scope` (`general` | `service`); FK opcional a `services` con `onDelete: SetNull`; bloque SEO (slug, schema_type).
2. **`Faq`:** preguntas/respuestas con bloque EDITORIAL completo; cascade al borrar grupo.
3. **`LeadMagnet`:** recurso gated RF-11; `file_id` UUID sin FK Prisma (referencia lógica a `media_assets`, igual que `hero_image_id` en otras entidades); `thank_you_url` obligatorio; `is_gated` default `true`.
4. **`CalculatorRule`:** reglas RF-Q1 por tipología; `boreholes_formula` JSON obligatorio; `is_active` default `true`; índice compuesto `(work_typology_id, is_active)`.
5. **Back-relations:** `faqGroups` y `leadMagnets` en `Service`; `calculatorRules` en `WorkTypology`.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `onDelete: SetNull` en `faq_groups.service_id` | Cascade | Preservar FAQs al retirar servicio |
| `onDelete: Cascade` en `faqs.faq_group_id` | Restrict | Limpiar FAQs al borrar grupo |
| `onDelete: Cascade` en `calculator_rules.work_typology_id` | Restrict | Reglas dependen de la tipología |
| `file_id` sin FK Prisma | FK dura a `media_assets` | Convención existente para referencias a media |
| Sin seed inline | Seed en DB-14 | Tabla CTE pendiente de validación técnica |
| Índice compuesto `(work_typology_id, is_active)` | Solo índices simples | Resolución eficiente de regla activa (RF-Q1) |

## Migración

- Nombre: `faqs_lead_magnets_calculator_rules`
- DDL: enum `FaqScope`, 4 tablas, unique en `faq_groups.slug` y `lead_magnets.slug`
- Índices: FKs, `faqs.workflow_status`, `calculator_rules.is_active`, compuesto `(work_typology_id, is_active)`
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — definiciones de contenido/recursos; PII de descargas en `leads` (DB-11) |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | Contenido técnico de FAQs sí; sin PII (RNF-IA) |
| Lead magnets | Solo metadatos del recurso; captura en `leads` |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
