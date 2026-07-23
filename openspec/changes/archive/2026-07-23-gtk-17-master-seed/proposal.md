# Proposal — gtk-17-master-seed

> US: [GTK-17 — Seed de catálogos maestros, RBAC, pipeline y plantillas IA](https://linear.app/geoteknia/issue/GTK-17/seed-de-catalogos-maestros-rbac-pipeline-y-plantillas-ia)
> Variante: **Harness DB (SEED)** | Dependencias: GTK-7, GTK-10, GTK-11, GTK-12, GTK-15, GTK-16 | Desbloquea: GTK-23, GTK-25, GTK-28, GTK-33, GTK-34, GTK-38, GTK-41

## Why

El sistema no opera sin datos maestros: estados del pipeline (RF-18), roles/permisos (RF-17), provincias operativas (RF-04), tipologías (RF-Q1), plantillas IA (RF-19), NAP corporativo (RF-09) y reglas de calculadora. Materializa la sección 9 de `data-model.md`.

## What Changes

- Crear `prisma/seed.ts` idempotente con upsert por clave natural.
- Crear `lib/auth/permissions.ts` como matriz RBAC canónica.
- Crear `lib/content/prompt-templates.seed.ts` con plantillas por `PromptPageType`.
- Configurar `prisma.seed` en `package.json`.
- Tests unitarios de matriz RBAC y cobertura de plantillas.

## Capabilities

### New Capabilities

- `master-seed`: seed idempotente de catálogos y configuración inicial.

## Impact

- **Código:** `prisma/seed.ts`, `lib/auth/permissions.ts`, `lib/content/prompt-templates.seed.ts`.
- **BD:** DML idempotente (sin migración DDL).
- **API / UI:** ninguno.
- **Datos placeholder:** NAP, teléfonos y reglas CTE pendientes de validación cliente.

## Fuera de alcance

- Usuario admin inicial (GTK-23).
- Servicios/geo-zonas editoriales (GTK-41).
- Índices avanzados (GTK-19).
