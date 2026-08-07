# prisma-schema-foundation — delta docker-local-ci-environment

## MODIFIED Requirements

### Requirement: Datasource PostgreSQL con pooler y conexión directa

El fichero `prisma/schema.prisma` SHALL configurar `datasource db` con `provider = "postgresql"`, `url = env("DATABASE_URL")` (conexión de runtime: pooler Neon EU en producción, o instancia PostgreSQL local/CI en desarrollo) y `directUrl = env("DIRECT_URL")` (conexión directa para migraciones Prisma).

#### Scenario: Schema válido con variables de entorno Neon

- **WHEN** se ejecuta `npx prisma validate` con `DATABASE_URL` y `DIRECT_URL` apuntando a Neon EU con `sslmode=require`
- **THEN** la validación completa sin errores

#### Scenario: Schema válido con variables de entorno Docker

- **WHEN** se ejecuta `npx prisma validate` con `DATABASE_URL` y `DIRECT_URL` apuntando a `localhost:5433` con `sslmode=disable`
- **THEN** la validación completa sin errores
