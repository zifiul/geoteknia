# Design — gtk-12-crm-contacts-leads-projects-pipeline

> Variante Harness DB — CRM completo en `prisma/schema.prisma`.

## Enfoque técnico

1. **`Contact`:** interlocutores deduplicados con índices en `email` y `phone`; soft delete RGPD.
2. **`Lead`:** conversión entrante inmutable con atribución (`utm_*`, `ga_client_id`), `reference_number` único, `gdpr_consent` no nullable y relación 1:1 opcional con `Project`.
3. **`ProjectState`:** catálogo configurable del pipeline; seed en DB-14.
4. **`Project`:** ficha viva 1:1 con lead (`lead_id` unique, `onDelete: Restrict`); control SLA vía `first_response_at`.
5. **`ProjectStateHistory`:** append-only sin `updated_at`/`deleted_at`; cascade al borrar proyecto.
6. **`ProjectMilestone`**, **`ProjectNote`**, **`ProjectDocument`:** gestión operativa con cascade desde proyecto.
7. **Cierre GTK-20:** `CaseStudy.sourceProject` FK a `Project` con `onDelete: SetNull`.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `projects.lead_id` unique + Restrict | Cascade desde lead | Lead inmutable; proyecto no sobrevive sin lead |
| Soft delete en contacts/leads/projects | Hard delete | RGPD derecho de supresión |
| Append-only en `project_state_history` | AUDIT completo | Auditoría de transiciones sin reescritura |
| `gdpr_consent` NOT NULL | Default false | Consentimiento explícito obligatorio (RNF-SEC) |
| `media_asset_id` sin FK Prisma | FK dura a `media_assets` | Convención existente para referencias a media |
| Sin seed inline | Seed en DB-14 | Estados del pipeline validados por negocio |

## Migración

- Nombre: `crm_contacts_leads_projects_pipeline`
- DDL: 5 enums, 8 tablas, FK `case_studies.source_project_id`
- Índices: reporting CRM (`lead_type`, `channel`, `source`, `created_at`, `state_id`, `is_qualified`)
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | Sí — nombre, email, teléfono, empresa, geolocalización, `ga_client_id`, datos en `project_data` |
| Base legal | Medidas precontractuales + consentimiento (`gdpr_consent`) |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en contacts, leads, projects |
| Append-only | `project_state_history` inmutable |
| IA / prompts | Prohibido enviar PII del CRM a Claude (RNF-IA) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
