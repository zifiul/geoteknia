# master-provinces-work-typologies — Delta Spec

## ADDED Requirements

### Requirement: Tabla provinces

El schema SHALL incluir `Province` con bloque AUDIT, `slug` único, `ccaa` obligatorio, `is_operational` default `false` e índice en `is_operational`.

#### Scenario: Default de is_operational

- **WHEN** se crea una provincia sin especificar `is_operational`
- **THEN** el valor por defecto es `false`

#### Scenario: Slug único de provincia

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `provinces.slug`

#### Scenario: Índice operacional

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `provinces.is_operational`

### Requirement: Tabla work_typologies

El schema SHALL incluir `WorkTypology` con bloque AUDIT, `slug` único y campos `description` y `order` opcionales.

#### Scenario: Slug único de tipología

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `work_typologies.slug`

#### Scenario: Orden de presentación opcional

- **WHEN** se crea una tipología sin especificar `order`
- **THEN** el campo acepta valor nulo
