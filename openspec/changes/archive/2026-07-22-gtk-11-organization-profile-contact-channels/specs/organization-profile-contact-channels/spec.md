# organization-profile-contact-channels — Delta Spec

## ADDED Requirements

### Requirement: Enum ContactDepartment

El schema SHALL incluir el enum `ContactDepartment` con valores `presupuestos`, `direccion_tecnica` y `licitaciones`.

#### Scenario: Valores del enum

- **WHEN** se inspecciona la migración
- **THEN** existe el tipo PostgreSQL `ContactDepartment` con los tres valores definidos

### Requirement: Tabla organization_profile

El schema SHALL incluir `OrganizationProfile` como singleton con bloque AUDIT, campos NAP obligatorios, `area_served` JSON obligatorio y campos opcionales `gbp_place_id`, `aggregate_rating` y `social_profiles`.

#### Scenario: Campos NAP obligatorios

- **WHEN** se inspecciona el modelo Prisma
- **THEN** `legalName`, `displayName`, `napAddress`, `napPhone` y `napEmail` son obligatorios

#### Scenario: Bloque AUDIT

- **WHEN** se inspecciona el modelo
- **THEN** incluye `createdAt`, `updatedAt`, `deletedAt`, `createdById` y `updatedById`

### Requirement: Tabla contact_channels

El schema SHALL incluir `ContactChannel` con bloque AUDIT, `department` de tipo `ContactDepartment`, campos de contacto opcionales, `prefilledMessageTemplate` opcional, `isActive` default `true` e índice en `department`.

#### Scenario: Índice por departamento

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `contact_channels.department`

#### Scenario: Canal activo por defecto

- **WHEN** se crea un canal sin especificar `isActive`
- **THEN** el valor por defecto es `true`
