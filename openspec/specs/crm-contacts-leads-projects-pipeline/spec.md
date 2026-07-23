# crm-contacts-leads-projects-pipeline Specification

## Purpose

CRM ligero de captación y pipeline comercial: contactos deduplicados (`contacts`), leads con atribución (`leads`), ficha viva de proyecto 1:1 con lead (`projects`), estados configurables del pipeline (`project_states`) e historial append-only, hitos, notas y documentos privados. Materializa GTK-12 y `docs/technical/data-model.md` §4.10. Articula captación B2B (RF-02/08/11/15), alta automática de ficha (RF-18) y control de primera respuesta (<48 h).

## Requirements

### Requirement: Enums CRM

El schema SHALL declarar los enums `LeadType`, `LeadChannel`, `LeadSource`, `MilestoneStatus` y `ProjectDocType` con los valores documentados en `docs/technical/data-model.md`.

#### Scenario: Tipo de lead válido

- **WHEN** se crea un registro `leads` con `lead_type='presupuesto'`
- **THEN** Prisma valida el valor contra el enum `LeadType`

### Requirement: Tabla contacts

El schema SHALL incluir `Contact` con índices en `email` y `phone`, FK opcional a `provinces` y bloque AUDIT con `deleted_at`.

#### Scenario: Soft delete RGPD en contactos

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Contact` declara `deletedAt DateTime? @map("deleted_at")`

### Requirement: Tabla leads

El schema SHALL incluir `Lead` con `reference_number` único, `gdpr_consent` no nullable, índices de reporting y bloque AUDIT con `deleted_at`.

#### Scenario: Referencia única de lead

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `leads.reference_number`

#### Scenario: Consentimiento obligatorio

- **WHEN** se inspecciona la migración
- **THEN** `leads.gdpr_consent` es `BOOLEAN NOT NULL`

#### Scenario: Relación 1:1 con proyecto

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Lead` declara `project Project?` y `Project.leadId` es `@unique`

#### Scenario: Lead con eventos atribuibles

- **WHEN** un lead tiene eventos de conversión asociados
- **THEN** se accede vía `lead.conversionEvents`

### Requirement: CRM leads con eventos de conversión

El modelo `Lead` SHALL exponer la relación 1:N opcional con `ConversionEvent`.

### Requirement: Tabla project_states

El schema SHALL incluir `ProjectState` con `slug` único, `order` indexado y flags `is_initial`, `is_won`, `is_lost`, `is_terminal`.

#### Scenario: Slug único de estado

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `project_states.slug`

### Requirement: Tabla projects

El schema SHALL incluir `Project` con `lead_id` unique FK restrict, `state_id` FK restrict, soft delete y control SLA via `first_response_at`.

#### Scenario: lead_id único 1:1

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `projects.lead_id`

#### Scenario: Soft delete RGPD en proyectos

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Project` declara `deletedAt DateTime? @map("deleted_at")`

### Requirement: Tabla project_state_history append-only

El schema SHALL incluir `ProjectStateHistory` sin `updated_at` ni `deleted_at`, con cascade desde `projects`.

#### Scenario: Historial append-only

- **WHEN** se inspecciona la migración
- **THEN** `project_state_history` no tiene columnas `updated_at` ni `deleted_at`

### Requirement: Tablas operativas del pipeline

El schema SHALL incluir `ProjectMilestone`, `ProjectNote` y `ProjectDocument` con cascade desde `projects` e índices en FKs relevantes.

#### Scenario: Cascade al borrar proyecto

- **WHEN** se inspecciona la migración
- **THEN** `project_milestones.project_id` referencia `projects.id` con `ON DELETE CASCADE`

### Requirement: Cierre FK case_studies.source_project_id

El schema SHALL declarar `CaseStudy.sourceProject` como relación Prisma a `Project` con `onDelete: SetNull`.

#### Scenario: FK case_study → project

- **WHEN** se inspecciona la migración
- **THEN** `case_studies.source_project_id` referencia `projects.id` con `ON DELETE SET NULL`

### Requirement: Back-relations CRM

El schema SHALL incluir back-relations `contacts`, `leads`, `projects` en `Province`; `leads`, `projects` en `Service` y `WorkTypology`; `leads` en `LeadMagnet`; `assignedProjects` en `User`.

#### Scenario: Provincia alimenta CRM

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Province` declara `contacts Contact[]`, `leads Lead[]` y `projects Project[]`
