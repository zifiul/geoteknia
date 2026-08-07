# Tasks — docker-local-ci-environment

## Step 0 — Rama (OBLIGATORIO)

- [ ] Crear rama `feature/docker-local-ci-environment` desde `main`.
- [ ] Verificar `git status` y confirmar que no se pisa trabajo ajeno.

## Fase 1 — Infraestructura Docker base

- [ ] Crear `.dockerignore` excluyendo secretos y artefactos locales.
- [ ] Crear `docker-compose.yml` con servicio `db` (postgres:16-alpine, volumen, healthcheck, loopback).
- [ ] Actualizar `.env.example` con variables Docker y Neon documentadas.
- [ ] Añadir scripts `docker:up`, `docker:down`, `docker:reset`, `docker:web`, `docker:logs` en `package.json`.

## Fase 2 — Validación de entorno y tests QA

- [ ] Añadir `refine` de esquema PostgreSQL en `lib/env.ts` para `DATABASE_URL` y `DIRECT_URL`.
- [ ] Actualizar `tests/helpers/test-env.ts` con `loadTestEnv()` unificado y defaults del contenedor.
- [ ] Unificar carga de entorno en los 11 ficheros `tests/qa/*.qa.test.ts`.
- [ ] Añadir script `test:qa` en `package.json`.
- [ ] Actualizar comentario en `lib/db.ts` (Neon → PostgreSQL genérico).

## Fase 3 — Dockerfile y servicio web

- [ ] Crear `Dockerfile` multi-stage (base, deps, dev, builder, runner) sobre `node:22-bookworm-slim`.
- [ ] Añadir servicio `web` en `docker-compose.yml` bajo `profiles: [web]`.
- [ ] Configurar volúmenes nombrados para `node_modules` y `.next`.
- [ ] Configurar healthcheck HTTP y override de `DATABASE_URL`/`DIRECT_URL` a `db:5432`.

## Fase 4 — Verificación base de datos (OBLIGATORIO — agente ejecuta)

- [ ] Arrancar `docker compose up -d db` y confirmar healthcheck verde.
- [ ] Ejecutar `pnpm exec prisma migrate deploy` contra contenedor.
- [ ] Ejecutar `pnpm db:seed` y `pnpm exec tsx scripts/seed-counts.ts`.
- [ ] Verificar persistencia tras `docker compose restart db`.
- [ ] Crear informe `reports/2026-08-03-step-N+1-unit-test-and-db-verification.md`.

## Fase 5 — Verificación tests (OBLIGATORIO — agente ejecuta)

- [ ] Ejecutar `pnpm typecheck`.
- [ ] Ejecutar `pnpm lint`.
- [ ] Ejecutar `pnpm test`.
- [ ] Ejecutar `pnpm test:qa`.
- [ ] Verificar que cadena Neon con `sslmode=require` valida en `lib/env.ts` (test unitario).

## Fase 6 — Verificación end-to-end (OBLIGATORIO — agente ejecuta)

- [ ] `docker compose --profile web up -d` con ambos healthchecks verdes.
- [ ] `curl` endpoint público y `/admin`.
- [ ] Ejecutar `pnpm test:e2e` contra BD contenedor.
- [ ] Crear informe `reports/2026-08-03-step-N+2-curl-endpoint-verification.md`.
- [ ] Crear informe `reports/2026-08-03-step-N+3-playwright-e2e-verification.md`.

## Fase 7 — CI

- [ ] Alinear credenciales Postgres en `e2e-a11y.yml` y `lighthouse.yml`.
- [ ] Crear `.github/workflows/ci.yml` con typecheck, lint, Vitest unit y QA.

## Fase 8 — Documentación (OBLIGATORIO)

- [ ] Actualizar `docs/technical/base-standards.md` §2 y §10.
- [ ] Actualizar `docs/technical/backend-standards.md` §7-8.
- [ ] Actualizar `docs/technical/development_guide.md` (setup Docker + Neon producción).
- [ ] Actualizar `README.md` §2.
- [ ] Actualizar `docs/functional/arquitectura-stack-web-b2b-geoteknia.md`.
- [ ] Actualizar `openspec/config.yaml`.

## Fase 9 — Cierre

- [ ] Ejecutar security-scan y code-review gate.
- [ ] Ejecutar `graphify update .`.
- [ ] Archivar change OpenSpec.
