# Proposal — gtk-12-crm-contacts-leads-projects-pipeline

> US: [GTK-12 — CRM ligero: contactos, leads, proyectos y pipeline](https://linear.app/geoteknia/issue/GTK-12/crm-ligero-contactos-leads-proyectos-y-pipeline)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-10, GTK-15, GTK-18, GTK-20 | Desbloquea: GTK-13, GTK-14

## Why

El CRM ligero articula la captación de negocio (RF-02/08/11/15/Q2), el alta automática de ficha (RF-18) y el control de primera respuesta (<48 h). Materializa las entidades 32–39 del modelo: `contacts`, `leads`, `projects`, `project_states`, `project_state_history`, `project_milestones`, `project_notes` y `project_documents`.

## What Changes

- Crear enums `LeadType`, `LeadChannel`, `LeadSource`, `MilestoneStatus`, `ProjectDocType`.
- Crear modelos CRM con bloque AUDIT (soft delete en `contacts`, `leads`, `projects`).
- Crear `ProjectStateHistory` append-only (sin `updated_at`/`deleted_at`).
- Cerrar FK `case_studies.source_project_id` → `projects` con `onDelete: SetNull`.
- Añadir back-relations en `Province`, `Service`, `WorkTypology`, `LeadMagnet` y `User`.
- Migración `crm_contacts_leads_projects_pipeline` (DDL-only, sin data migration).
- Seed de `project_states` pendiente de DB-14.

## Capabilities

### New Capabilities

- `crm-contacts-leads-projects-pipeline`: contactos deduplicados, leads con atribución, proyectos 1:1 con leads y entidades de pipeline.

### Modified Capabilities

- `case-studies-team-machinery`: relación Prisma `CaseStudy.sourceProject` → `Project`.
- `master-provinces-work-typologies`: back-relations `contacts`, `leads`, `projects` en `Province`; `leads`, `projects` en `WorkTypology`.
- `services-geo-zones-intersection`: back-relations `leads`, `projects` en `Service`.
- `faqs-lead-magnets-calculator-rules`: back-relation `leads` en `LeadMagnet`.
- `rbac-identity-audit`: back-relation `assignedProjects` en `User`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** ocho tablas + cinco enums en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** PII en `contacts`, `leads`, `projects`; soft delete; `gdpr_consent` obligatorio en leads.
- **Tickets desbloqueados:** GTK-13, GTK-14.

## Fuera de alcance

- Seed de los 7 `project_states` (DB-14).
- Índices parciales `WHERE deleted_at IS NULL` (DB-15).
- Lógica de dominio en `/lib/`.
- `conversion_events` (ticket posterior).
