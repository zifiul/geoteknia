# Design — docker-local-ci-environment

## Arquitectura

```mermaid
flowchart LR
  subgraph host [Host Windows PowerShell]
    DEV["pnpm dev :3000"]
    VERIFY["typecheck lint vitest playwright"]
    MIG["prisma migrate dev"]
  end
  subgraph compose [Docker Compose red geoteknia]
    DB[("db postgres:16-alpine")]
    WEB["web profile node:22-bookworm-slim"]
    VOL[("geoteknia-pgdata")]
    DB --- VOL
    WEB -->|"db:5432"| DB
  end
  DEV -->|"localhost:5433"| DB
  VERIFY -->|"localhost:5433"| DB
  MIG -->|"localhost:5433"| DB
  subgraph prod [Produccion sin cambios]
    VERCEL["Vercel"] -->|"sslmode=require"| NEON[("Neon EU")]
  end
```

## Servicios Docker Compose

### `db` (siempre activo)

| Parámetro | Valor |
|---|---|
| Imagen | `postgres:16-alpine` |
| Volumen | `geoteknia-pgdata` |
| Puerto host | `127.0.0.1:${POSTGRES_HOST_PORT:-5433}:5432` |
| Usuario | `${POSTGRES_USER:-geoteknia}` |
| Contraseña | `${POSTGRES_PASSWORD:-geoteknia_dev_only}` (solo desarrollo) |
| Base de datos | `${POSTGRES_DB:-geoteknia_dev}` |
| Healthcheck | `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` |

### `web` (profile `web`)

| Parámetro | Valor |
|---|---|
| Build | `Dockerfile` target `runner` (producción) o `dev` (hot reload) |
| Depends on | `db: condition: service_healthy` |
| Puerto | `127.0.0.1:${WEB_HOST_PORT:-3000}:3000` |
| Usuario | `node` (no root) |
| Volúmenes | bind mount código + volúmenes nombrados `node_modules` y `.next` |
| Env override | `DATABASE_URL`/`DIRECT_URL` → `postgresql://...@db:5432/...` |
| Dev polling | `WATCHPACK_POLLING=true` en target `dev` |

## Dockerfile multi-stage

1. **base**: `node:22-bookworm-slim`, `corepack enable`, `pnpm@11.0.8`.
2. **deps**: `pnpm install --frozen-lockfile`, `prisma generate`.
3. **dev**: target para `next dev` con polling.
4. **builder**: `next build` (requiere `db` accesible por ISR).
5. **runner**: `next start`, usuario `node`, healthcheck HTTP.

Dependencias nativas (`argon2`, `sharp`, `@prisma/engines`) compilan sobre glibc Debian sin `binaryTargets` adicionales en `schema.prisma`.

## Variables de entorno dual

| Entorno | `DATABASE_URL` / `DIRECT_URL` | `sslmode` |
|---|---|---|
| Docker local/CI | `postgresql://geoteknia:...@localhost:5433/geoteknia_dev` | `disable` |
| Neon producción | `postgresql://...@host.eu-central-1.aws.neon.tech/geoteknia` | `require` |

El `.env` del host apunta a `localhost:5433`. El servicio `web` reescribe las URLs a `db:5432` en su bloque `environment:` (precedencia sobre `env_file`).

## Migraciones y seed

```powershell
# Arranque
pnpm run docker:up

# Migraciones (host)
pnpm exec prisma migrate deploy

# Seed
pnpm db:seed

# Reset completo
pnpm run docker:reset
pnpm exec prisma migrate deploy
pnpm db:seed
```

## Tests

- **Host (decisión adoptada):** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:qa`, `pnpm test:e2e` contra `localhost:5433`.
- Unificar carga de entorno QA en `tests/helpers/test-env.ts` con `loadTestEnv()` que invoque `dotenv` y aplique defaults del contenedor.
- Script `test:qa`: `vitest run tests/qa`.

## CI

- Alinear `e2e-a11y.yml` y `lighthouse.yml` con credenciales Compose (`geoteknia_dev`, puerto interno 5432).
- Nuevo workflow `ci.yml`: typecheck + lint + Vitest unit + QA contra `services: postgres`.

## Threat model

### Superficie de ataque

- Puertos expuestos en loopback: `5433` (PostgreSQL) y `3000` (web).
- Credenciales por defecto en `docker-compose.yml`.
- Imagen Docker con código de aplicación y dependencias nativas.
- Bind mount del código fuente en modo dev.
- `.env` cargado vía `env_file` en servicio web (no copiado a imagen).

### Actores

- Desarrollador local (legítimo).
- Proceso malicioso en la misma máquina que podría alcanzar `127.0.0.1:5433`.
- Atacante con acceso a red local (riesgo bajo si bind es loopback).

### Datos sensibles implicados

- Credenciales de BD de desarrollo (sin PII real).
- Variables de `.env` (secretos de Auth.js, Turnstile, Anthropic) cargadas en contenedor web.
- Datos sintéticos de seed y fixtures de test.

**RGPD:** La exigencia de región EU aplica a producción (Neon EU). Los datos en contenedor local son sintéticos de desarrollo; se documenta explícitamente que no deben usarse datos reales de clientes en Docker local.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Credenciales triviales en compose | Acceso a `localhost:5433` desde la misma máquina | Bajo (solo dev) | Bind `127.0.0.1`, valores marcados como solo desarrollo, documentación |
| T2 | Filtración de `.env` a imagen | `COPY` sin `.dockerignore` | Alto | `.dockerignore` excluye `.env*`, sin `ARG` de secretos |
| T3 | Escalada en contenedor | Vulnerabilidad en dependencia | Medio | Usuario no root `node`, sin `--privileged`, sin socket Docker |
| T4 | Exposición de secretos server-only al cliente | Montaje incorrecto de env | Alto | Sin cambios en `lib/env.ts` server-only; `NEXT_PUBLIC_*` sin secretos |
| T5 | Regresión producción Neon | Validación Zod demasiado estricta | Alto | `refine` acepta ambos formatos; test unitario con cadena Neon |
| T6 | PII en BD local | Importar dump de producción | Alto | Documentar prohibición explícita; solo seed sintético |

### Amenazas descartadas

- **Authz/RBAC en contenedor:** Sin cambios en lógica de auth; fuera de alcance.
- **Turnstile bypass:** Sin cambios en endpoints públicos.
- **Prompt injection IA:** Sin cambios en integración Claude.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: `.dockerignore` excluye `.env`, `.env.*`, `node_modules`, `.next`, `graphify-out/`, `.codegraph/`, artefactos de test y `.git`.
- [ ] SEC-2: El stage `runner` del `Dockerfile` ejecuta `next start` como usuario `node`, no como root.
- [ ] SEC-3: El servicio `db` publica el puerto solo en `127.0.0.1`, no en `0.0.0.0`.
- [ ] SEC-4: Ningún secreto real aparece en ficheros versionados; credenciales Docker marcadas como solo desarrollo.
- [ ] SEC-5: `lib/env.ts` valida cadenas Neon con `sslmode=require` y cadenas Docker con `sslmode=disable` sin error.

## Decisiones de diseño

| Decisión | Elección | Motivo |
|---|---|---|
| Verificaciones en host | typecheck/lint/test/e2e desde PowerShell | Playwright MCP del harness, menor imagen |
| Web como profile | `docker compose up` solo levanta `db` | `pnpm dev` sigue siendo flujo diario |
| Sin `output: standalone` | No tocar `next.config.ts` | Cero riesgo en build Vercel |
| Misma imagen Postgres que CI | `postgres:16-alpine` | Paridad exacta local/CI |
