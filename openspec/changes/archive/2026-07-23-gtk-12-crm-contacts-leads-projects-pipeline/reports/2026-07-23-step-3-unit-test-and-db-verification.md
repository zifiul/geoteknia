# Informe — GTK-12 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-12-crm-contacts-leads-projects-pipeline`  
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
| `npx prisma migrate dev --name crm_contacts_leads_projects_pipeline` | ✅ Migración creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con entidades CRM |

## Criterios de aceptación GTK-12

| Criterio | Estado |
|----------|--------|
| Enums `LeadType`, `LeadChannel`, `LeadSource`, `MilestoneStatus`, `ProjectDocType` | ✅ |
| `leads.reference_number` único | ✅ |
| `projects.lead_id` único (1:1 lead↔proyecto) | ✅ |
| `contacts`, `leads`, `projects` con `deleted_at` (soft delete RGPD) | ✅ |
| `project_state_history` append-only (sin `updated_at`/`deleted_at`) | ✅ |
| `leads.gdpr_consent` NOT NULL | ✅ |
| FK `case_studies.source_project_id` → `projects` con `ON DELETE SET NULL` | ✅ |
| Back-relations en `Province`, `Service`, `WorkTypology`, `LeadMagnet`, `User` | ✅ |
| Sin seed de `project_states` (pendiente DB-14) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
