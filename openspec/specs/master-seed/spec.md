# master-seed Specification

## Purpose

Seed idempotente de catálogos maestros, RBAC, pipeline comercial, configuración corporativa, plantillas IA y reglas de calculadora. Materializa GTK-17 y `docs/technical/data-model.md` §9. Prerrequisito operativo para login (RF-17), alta automática de leads (RF-18) y generación IA (RF-19).

## Requirements

### Requirement: Seed idempotente de catálogos maestros

El proyecto SHALL incluir `prisma/seed.ts` ejecutable vía `prisma db seed` que puebla datos maestros con upsert por clave natural sin duplicar filas en ejecuciones repetidas.

#### Scenario: Segunda ejecución sin duplicados

- **WHEN** se ejecuta `prisma db seed` dos veces consecutivas
- **THEN** los conteos de `project_states`, `roles`, `permissions`, `provinces`, `work_typologies`, `prompt_templates`, `organization_profile`, `contact_channels`, `calculator_rules` y `ai_budget_config` permanecen estables

### Requirement: Estados del pipeline

El seed SHALL crear 7 `project_states` con flags correctos y un único estado `is_initial=true` (`lead-nuevo`).

#### Scenario: Estado inicial único

- **WHEN** se inspecciona la BD tras el seed
- **THEN** exactamente un registro tiene `is_initial=true` y slug `lead-nuevo`

### Requirement: Matriz RBAC canónica

El seed SHALL poblar roles `admin`, `gestor`, `editor`, `tecnico`, permisos atómicos por módulo y `role_permissions` según `lib/auth/permissions.ts`.

#### Scenario: admin tiene todos los permisos

- **WHEN** se resuelven permisos del rol admin
- **THEN** incluye todos los códigos definidos en `PERMISSIONS`

#### Scenario: tecnico solo lectura

- **WHEN** se resuelven permisos del rol tecnico
- **THEN** el único permiso es `projects.read`

### Requirement: Datos operativos mínimos

El seed SHALL crear 5 provincias operativas, 4 tipologías de obra, singleton `organization_profile`, un canal por departamento, reglas de calculadora por tipología, plantillas IA por `PromptPageType` y configuración global `ai_budget_config`.

#### Scenario: Plantilla por tipo de página

- **WHEN** se inspecciona `prompt_templates` tras el seed
- **THEN** existe al menos una plantilla activa por cada valor de `PromptPageType`
