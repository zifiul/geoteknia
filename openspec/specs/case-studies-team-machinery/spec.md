# case-studies-team-machinery Specification

## Purpose

Entidades de prueba de solvencia (E-E-A-T): casos de estudio publicables (`case_studies`), fichas de equipo técnico (`team_members`), parque de maquinaria (`machinery`) y tablas puente M:N. Materializa GTK-20 y `docs/technical/data-model.md` §4.5. Demuestra capacidad operativa, refuerza firma de informes y alimenta linking interno hacia servicios y zonas.

## Requirements

### Requirement: Enum EquipmentType

El schema SHALL declarar el enum `EquipmentType` con valores `sonda_rotacion`, `sonda_percusion`, `mixta`, `ensayo_in_situ`, `laboratorio`, `vehiculo_especial`.

#### Scenario: Clasificación de maquinaria

- **WHEN** se crea un registro `machinery` con `equipment_type='sonda_rotacion'`
- **THEN** Prisma valida el valor contra el enum `EquipmentType`

### Requirement: Tabla case_studies

El schema SHALL incluir `CaseStudy` con FKs restrict a `services`, `provinces` y `work_typologies`; bloques SEO/EDITORIAL/AUDIT; relación opcional `sourceProject` a `projects` (`onDelete: SetNull`); índices en FKs, `project_year` y `workflow_status`.

#### Scenario: Default editorial en caso de estudio

- **WHEN** se crea un caso sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

#### Scenario: Slug único de caso

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `case_studies.slug`

#### Scenario: FK source_project_id a projects

- **WHEN** se inspecciona la migración
- **THEN** `case_studies.source_project_id` referencia `projects.id` con `ON DELETE SET NULL`

### Requirement: Tabla team_members

El schema SHALL incluir `TeamMember` con bloque SEO (solo `slug` único), bloques EDITORIAL/AUDIT, índice en `college_registration_no` y enlace opcional 1:1 con `users` (`user_id` unique, `onDelete: SetNull`).

#### Scenario: user_id único opcional

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `team_members.user_id`

#### Scenario: FK a users con set null

- **WHEN** se inspecciona la migración
- **THEN** `team_members.user_id` referencia `users.id` con `ON DELETE SET NULL`

### Requirement: Tabla machinery

El schema SHALL incluir `Machinery` con `equipment_type` indexado, bloque SEO (solo `slug` único) y bloques EDITORIAL/AUDIT.

#### Scenario: Índice por tipo de equipo

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `machinery.equipment_type`

### Requirement: Tabla case_study_team_members

El schema SHALL incluir `CaseStudyTeamMember` como puente M:N con PK compuesta `(case_study_id, team_member_id)`, campo `role` opcional y cascade en FKs.

#### Scenario: PK compuesta del puente caso-equipo

- **WHEN** se inspecciona la migración
- **THEN** la clave primaria de `case_study_team_members` es `(case_study_id, team_member_id)`

### Requirement: Tabla machinery_services

El schema SHALL incluir `MachineryService` como puente M:N con PK compuesta `(machinery_id, service_id)` y cascade en FKs.

#### Scenario: PK compuesta maquinaria-servicio

- **WHEN** se inspecciona la migración
- **THEN** la clave primaria de `machinery_services` es `(machinery_id, service_id)`

### Requirement: Back-relations

El schema SHALL incluir `caseStudies` en `Service`, `Province` y `WorkTypology`; `machineryServices` en `Service`; `teamMember` opcional en `User`.

#### Scenario: Relación servicio a casos

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Service` declara `caseStudies CaseStudy[]` y `machineryServices MachineryService[]`

#### Scenario: Relación usuario a ficha de equipo

- **WHEN** se inspecciona el schema Prisma
- **THEN** `User` declara `teamMember TeamMember?`
