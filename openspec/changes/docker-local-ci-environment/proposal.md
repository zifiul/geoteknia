# Proposal — docker-local-ci-environment

## Why

El desarrollo local y los pipelines de CI dependen hoy de una base de datos Neon gestionada en la nube, lo que introduce fricción (cuenta, branches, latencia, coste) y divergencia respecto a los workflows de GitHub Actions que ya usan PostgreSQL en contenedor. Se necesita un entorno reproducible con un único comando que levante Postgres y, opcionalmente, la aplicación web, sin alterar el despliegue de producción en Vercel + Neon.

## What Changes

- Añadir `docker-compose.yml` con servicio PostgreSQL 16 (`postgres:16-alpine`), volumen persistente, healthcheck `pg_isready` y puerto host configurable.
- Añadir `Dockerfile` multi-stage (deps → build → runtime) y servicio `web` bajo profile `web` para paridad y verificación E2E.
- Añadir `.dockerignore` y scripts de conveniencia en `package.json` (`docker:up`, `docker:down`, etc.).
- Documentar variables de entorno duales: Docker local/CI (`sslmode=disable`) y Neon producción (`sslmode=require`).
- Refinar validación Zod de `DATABASE_URL`/`DIRECT_URL` para exigir esquema PostgreSQL sin romper cadenas Neon.
- Unificar carga de entorno en tests QA y añadir script `test:qa`.
- Alinear workflows CI existentes y añadir workflow de typecheck/lint/Vitest.
- Actualizar documentación técnica y funcional para distinguir Docker (local/CI) de Neon (producción).

## Capabilities

### New Capabilities

- `local-container-environment`: Orquestación Docker Compose de PostgreSQL y aplicación Next.js para desarrollo local y CI, con migraciones, seed, healthchecks y comandos documentados de arranque/parada/reset.

### Modified Capabilities

- `prisma-schema-foundation`: Generalizar el requisito de datasource dual para aceptar PostgreSQL en contenedor además de Neon EU.
- `db-client`: Actualizar la descripción del singleton Prisma para reflejar entornos Docker y Neon sin cambiar comportamiento.
- `env-validation`: Añadir validación de esquema `postgresql://`/`postgres://` en URLs de base de datos.

## Impact

- **Infraestructura local:** requiere Docker Desktop (WSL2) en Windows.
- **Variables de entorno:** `.env.example`, `lib/env.ts`, `tests/helpers/test-env.ts`.
- **Tests:** 11 ficheros `tests/qa/*.qa.test.ts`, `package.json` scripts.
- **CI:** `.github/workflows/e2e-a11y.yml`, `lighthouse.yml`, nuevo workflow de tests unitarios.
- **Documentación:** `base-standards.md`, `backend-standards.md`, `development_guide.md`, `README.md`, `arquitectura-stack-web-b2b-geoteknia.md`, `openspec/config.yaml`.
- **Sin impacto en producción:** Vercel, Neon, `vercel.json` y `next.config.ts` permanecen sin cambios funcionales.

## Fuera de alcance

- Cambios de esquema Prisma o modelo de datos.
- Migración de datos desde Neon.
- Despliegue self-hosted de producción.
- Sustitución de Cloudflare, el proveedor SMTP, Turnstile o Anthropic.
- Sustituir `pnpm dev` en host como flujo diario de desarrollo.

## Linear

No disponible (MCP Linear en error de conexión). Change de infraestructura transversal sin ticket vinculado.
