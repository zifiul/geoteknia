# local-container-environment — delta docker-local-ci-environment

## ADDED Requirements

### Requirement: Servicio PostgreSQL en Docker Compose

The system SHALL provide a `db` service in `docker-compose.yml` using image `postgres:16-alpine` with a named volume for data persistence, healthcheck via `pg_isready`, credentials configurable via environment variables with development-only defaults, and host port binding on `127.0.0.1` with default port `5433` to avoid collision with local PostgreSQL installations.

#### Scenario: Base de datos arranca y pasa healthcheck

- **WHEN** the developer runs `docker compose up -d db` from a clean clone with Docker Desktop running
- **THEN** the `db` service reaches healthy state within 30 seconds and accepts connections on `localhost:5433`

#### Scenario: Datos persisten entre reinicios

- **WHEN** data is written to the database and `docker compose restart db` is executed
- **THEN** the previously written data remains accessible

#### Scenario: Reset de volumen documentado

- **WHEN** the developer runs `docker compose down -v` followed by `docker compose up -d db` and `pnpm exec prisma migrate deploy`
- **THEN** the database is empty except for schema applied by migrations

### Requirement: Servicio web opcional bajo profile

The system SHALL provide a `web` service in `docker-compose.yml` under profile `web`, depending on `db` with `condition: service_healthy`, running as non-root user, with healthcheck verifying HTTP response, and `DATABASE_URL`/`DIRECT_URL` rewritten to reach `db:5432` internally.

#### Scenario: Solo base de datos por defecto

- **WHEN** the developer runs `docker compose up -d` without profiles
- **THEN** only the `db` service starts

#### Scenario: Aplicación web con profile

- **WHEN** the developer runs `docker compose --profile web up -d`
- **THEN** both `db` and `web` services start and `web` becomes healthy after `db` is healthy

### Requirement: Dockerfile multi-stage compatible con dependencias nativas

The system SHALL provide a `Dockerfile` with stages `base`, `deps`, `dev`, `builder` and `runner` based on `node:22-bookworm-slim`, using `corepack` to activate `pnpm@11.0.8`, installing native dependencies (`argon2`, `sharp`, Prisma engines) successfully, and running the runtime stage as non-root `node` user.

#### Scenario: Build de imagen exitoso

- **WHEN** `docker compose build web` is executed with `db` healthy
- **THEN** the image builds without errors and includes a working Next.js production build

### Requirement: Exclusión de secretos y artefactos locales

The system SHALL provide a `.dockerignore` that excludes `.env`, `.env.*`, `node_modules`, `.next`, `graphify-out/`, `.codegraph/`, test artifacts and `.git` from the Docker build context.

#### Scenario: Sin secretos en imagen

- **WHEN** the Docker image is built with a populated `.env` file in the project root
- **THEN** the `.env` file is not copied into any image layer

### Requirement: Scripts de conveniencia

The system SHALL expose npm scripts `docker:up`, `docker:down`, `docker:reset`, `docker:web` and `docker:logs` in `package.json` that wrap the corresponding `docker compose` commands.

#### Scenario: Arranque con un comando

- **WHEN** the developer runs `pnpm run docker:up`
- **THEN** the `db` service starts in detached mode

### Requirement: Migraciones y seed contra contenedor

The system SHALL support `pnpm exec prisma migrate deploy`, `pnpm exec prisma migrate dev` and `pnpm db:seed` executed from the host against `localhost:5433` when `DATABASE_URL` and `DIRECT_URL` point to the Docker PostgreSQL instance.

#### Scenario: Migraciones aplican correctamente

- **WHEN** `docker compose up -d db` is running and `pnpm exec prisma migrate deploy` is executed
- **THEN** all 18 migrations apply without error

#### Scenario: Seed idempotente

- **WHEN** `pnpm db:seed` is executed twice against the container database
- **THEN** both executions complete without error and master catalog counts remain stable
