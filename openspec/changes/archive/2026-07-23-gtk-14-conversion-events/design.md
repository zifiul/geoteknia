# Design — gtk-14-conversion-events

> Variante Harness DB — tabla append-only `conversion_events` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`ConversionEventName`:** enum con los 8 eventos del dataLayer GTM/GA4.
2. **`ConversionEvent`:** append-only — solo `occurred_at` como timestamp; sin bloque AUDIT completo.
3. **Atribución:** slugs denormalizados (`service_slug`, `province_slug`) para reporting CPL sin JOIN a maestros.
4. **Lead opcional:** FK `lead_id` SetNull — eventos pueden existir antes de la conversión formal.
5. **Reutilización:** `LeadType` y `LeadSource` ya definidos en GTK-12.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Append-only sin soft delete | Bloque AUDIT completo | Trazabilidad inmutable de medición (RNF-DATA) |
| Slugs denormalizados | FK a services/provinces | Reporting CPL alineado con dataLayer; evita JOIN en agregaciones |
| `lead_id` nullable SetNull | Cascade | Lead puede borrarse (soft delete); evento histórico persiste |
| Sin seed | Datos de demo | Tabla se puebla en runtime desde frontal/endpoint |
| Índice compuesto service×province | Índices separados | Eje principal de análisis SEO/CPL |

## Migración

- Nombre: `conversion_events`
- DDL: 1 enum, 1 tabla, FK `conversion_events.lead_id`, 4 índices
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | Parcial — `ga_client_id`, `session_id` son identificadores de seguimiento |
| Base legal | Consentimiento cookies analíticas |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Append-only | Sin `updated_at`/`deleted_at`; inmutable |
| Retención | Política futura; BRIN/particionado en GTK-19 |
| IA / prompts | Prohibido enviar datos de tracking a Claude (RNF-IA) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
