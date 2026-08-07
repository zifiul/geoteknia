# Informe de seguridad — docker-local-ci-environment

## SEC-1 `.dockerignore`

Verificado: excluye `.env`, `.env.*`, `node_modules`, `.next`, `graphify-out/`, `.codegraph/`, artefactos de test, `.git`.

## SEC-2 Usuario no root

`Dockerfile` runner: usuario `nodejs` (UID 1001), `CMD` vía `node` directo (sin corepack en runtime).

## SEC-3 Bind loopback

`docker-compose.yml`: puertos `127.0.0.1:5433` y `127.0.0.1:3000`.

## SEC-4 Secretos

Credenciales por defecto marcadas como solo desarrollo en `docker-compose.yml` y `.env.example`. Sin secretos reales versionados.

## SEC-5 Validación dual Neon/Docker

Tests unitarios en `tests/unit/env.test.ts`: cadenas Neon (`sslmode=require`) y Docker (`sslmode=disable`) validan correctamente.

## Veredicto

**APTO** para desarrollo local/CI. Producción sin cambios (Vercel + Neon).
