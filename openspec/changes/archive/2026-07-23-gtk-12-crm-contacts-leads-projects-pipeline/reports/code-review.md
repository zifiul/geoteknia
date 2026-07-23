# Code Review — GTK-12 CRM ligero: contactos, leads, proyectos y pipeline

**Fecha:** 2026-07-23  
**Change:** `gtk-12-crm-contacts-leads-projects-pipeline`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — enums CRM, modelos `Contact`, `Lead`, `ProjectState`, `Project`, pipeline y back-relations
- `prisma/migrations/20260723055748_crm_contacts_leads_projects_pipeline/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PKs | ✅ |
| Modelos alineados con `data-model.md` §4.10 | ✅ |
| Bloque AUDIT con soft delete en contacts/leads/projects | ✅ |
| `project_state_history` append-only | ✅ |
| `leads.reference_number` único | ✅ |
| `projects.lead_id` único 1:1 | ✅ |
| `leads.gdpr_consent` NOT NULL | ✅ |
| FK `case_studies.source_project_id` → `projects` ON DELETE SET NULL | ✅ |
| Índices de reporting CRM | ✅ |
| Back-relations en Province/Service/WorkTypology/LeadMagnet/User | ✅ |
| Sin seed de project_states (DB-14) | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.

Veredicto: APTO
