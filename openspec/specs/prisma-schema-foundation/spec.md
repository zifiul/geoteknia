# prisma-schema-foundation Specification

## Purpose

Fundación del schema Prisma de Geoteknia: datasource dual Neon, enums transversales y convenciones de bloques reutilizables documentadas en `schema.prisma`.

## Requirements

### Requirement: Datasource PostgreSQL con pooler y conexión directa Neon

El fichero `prisma/schema.prisma` SHALL configurar `datasource db` con `provider = "postgresql"`, `url = env("DATABASE_URL")` (pooler Neon EU) y `directUrl = env("DIRECT_URL")` (conexión directa para migraciones).

#### Scenario: Schema válido con variables de entorno Neon

- **WHEN** se ejecuta `npx prisma validate` con `DATABASE_URL` y `DIRECT_URL` definidas
- **THEN** la validación completa sin errores

### Requirement: Enums transversales del modelo de datos

El schema SHALL declarar los enums `WorkflowStatus`, `SchemaType` y `AiModel` con los valores definidos en `docs/technical/data-model.md` §3, incluyendo `@map` en `AiModel` para los identificadores reales de la API de Anthropic.

#### Scenario: Enums presentes tras migración

- **WHEN** se aplica la migración inicial del change en PostgreSQL
- **THEN** existen los tipos nativos `WorkflowStatus`, `SchemaType` y `AiModel` con todos sus valores

#### Scenario: Valores de WorkflowStatus editorial

- **WHEN** se inspecciona el enum `WorkflowStatus` en el schema
- **THEN** incluye `borrador_ia`, `en_revision`, `aprobado`, `publicado`, `rechazado` y `despublicado`

### Requirement: Convención de bloques reutilizables documentada

El schema SHALL incluir comentarios de referencia que describen los campos de los bloques AUDIT, SEO y EDITORIAL para que los tickets DB posteriores los repliquen de forma consistente.

#### Scenario: Bloques documentados sin modelos aún

- **WHEN** un desarrollador abre `prisma/schema.prisma` tras este change
- **THEN** encuentra comentarios con la plantilla de campos AUDIT, SEO y EDITORIAL alineados con `data-model.md` §2
