# Tasks — gtk-6-fundacion-schema-prisma

> US: GTK-6 — Fundación del esquema Prisma | Variante: **Harness DB**
> Fases omitidas: contrato API (2), frontend (4b), TDD-RED (3 — schema puro), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/data-model.md` §2–3 y descripción Linear GTK-6.
- [x] 0.2 Crear rama `feature/db-gtk-6-fundacion-schema-prisma`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Schema Prisma y variables de entorno

- [x] 1.1 Actualizar `prisma/schema.prisma`: `directUrl`, enums `WorkflowStatus`, `SchemaType`, `AiModel` y comentarios de bloques AUDIT/SEO/EDITORIAL.
- [x] 1.2 Añadir `DIRECT_URL` a `lib/env.ts` y `.env.example`.
- [x] 1.3 Actualizar `tests/unit/env.test.ts` con `DIRECT_URL`.

## 2. Migración y cliente Prisma

- [x] 2.1 Ejecutar `npx prisma validate`.
- [x] 2.2 Ejecutar `npx prisma migrate dev --name init_enums_and_datasource` (migración SQL creada; apply bloqueado sin credenciales Neon — ver reporte).
- [x] 2.3 Ejecutar `npx prisma generate`.

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Verificación BD: documentar resultado de migrate/validate en reporte.
- [x] 3.3 Crear informe `openspec/changes/gtk-6-fundacion-schema-prisma/reports/2026-07-20-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar `.env.example` sin valores reales.
- [x] 4.2 Crear `openspec/changes/gtk-6-fundacion-schema-prisma/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Confirmar alineación con `docs/technical/data-model.md` §2–3 (sin duplicar; enums ya documentados).
- [x] 5.2 Actualizar delta specs en el change si hubo desviación.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-6-fundacion-schema-prisma/reports/code-review.md` con `Veredicto: APTO`.
