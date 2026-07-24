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

#### Scenario: Relación en schema Prisma

- **WHEN** se inspecciona el modelo `Lead` en Prisma
- **THEN** declara `conversionEvents ConversionEvent[]`

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

### Requirement: Alta automática lead y proyecto vía captación pública

Además del schema Prisma existente, el sistema SHALL permitir crear en runtime un par `Lead` + `Project` 1:1 desde el endpoint público de presupuesto: `lead_type=presupuesto`, `channel=formulario`, `project.state_id` apuntando al `ProjectState` con `is_initial=true` (seed `lead-nuevo`), sin insertar fila en `project_state_history` en el alta anónima.

#### Scenario: Proyecto en estado inicial

- **WHEN** se completa un POST de presupuesto válido
- **THEN** existe exactamente un `projects` con `lead_id` único del lead creado y `state.slug='lead-nuevo'`

#### Scenario: Deduplicación de contacto

- **WHEN** ya existe un `contacts` con el mismo `email` o `phone` y `deleted_at IS NULL`
- **THEN** el nuevo lead se asocia a ese contacto y se rellenan campos vacíos del contacto sin duplicar fila

### Requirement: Upsert de contacto en captación pública

El pipeline de captación SHALL usar un helper compartido `upsertContact` que deduplica por email OR teléfono (`deleted_at IS NULL`) y rellena solo los campos presentes (`full_name`, `email`, `phone`, `company`, `professional_role`, `province_id` opcionales).

#### Scenario: Contacto mínimo solo teléfono

- **WHEN** `createLocationLead` recibe solo teléfono sin nombre ni rol
- **THEN** se crea o actualiza `contacts` con `phone` y columnas opcionales en null sin exigir `full_name` ni `professional_role`

### Requirement: Título de proyecto parametrizable

`createProjectFromLead` SHALL aceptar un prefijo de título (p. ej. `Presupuesto` o `Ubicación`) para generar `projects.title` cuando `service` y/o `province` son null.

#### Scenario: Proyecto desde lead de ubicación

- **WHEN** se crea project desde lead `ubicacion` sin `service_id`
- **THEN** el título comienza con el prefijo `Ubicación` y sigue siendo NOT NULL

### Requirement: Expediente e importe en proyecto desde lead

`createProjectFromLead` SHALL aceptar opcionalmente `expedienteRef` y `estimatedValue` y persistirlos en `projects.expediente_ref` y `projects.estimated_value` cuando se proporcionen, sin alterar el comportamiento de captación presupuesto/ubicación cuando no se pasan.

#### Scenario: Proyecto con expediente e importe

- **WHEN** el caso de uso invoca `createProjectFromLead` con `expedienteRef` e `estimatedValue`
- **THEN** el registro `project` creado incluye esos valores en las columnas correspondientes

#### Scenario: Proyecto presupuesto sin campos nuevos

- **WHEN** `createBudgetLead` invoca `createProjectFromLead` sin `expedienteRef` ni `estimatedValue`
- **THEN** el proyecto se crea igual que antes (campos null)

### Requirement: Lectura operativa del pipeline en admin

El dominio CRM SHALL permitir consultas de solo lectura sobre `projects` activos (`deleted_at` IS NULL) desde el portal autenticado, alineadas con `docs/technical/data-model.md` §4.10, sin exponer PII fuera de `/admin`.

#### Scenario: Soft delete respetado en lecturas

- **WHEN** un proyecto tiene `deleted_at` establecido
- **THEN** no aparece en listados ni detalle del pipeline admin
