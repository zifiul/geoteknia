# Tasks — gtk-19-performance-indexes

> US: GTK-19 — Índices de rendimiento | Variante: **Harness DB**
> Fases omitidas: contrato API (2), frontend (4b), TDD-RED (3 — DDL-only), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/technical/data-model.md` §7 y descripción Linear GTK-19.
- [x] 0.2 Crear rama `feature/db-gtk-19-performance-indexes`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Migración SQL de índices avanzados

- [x] 1.1 Crear migración `performance_partial_brin_gin_indexes` con SQL custom.
- [x] 1.2 Índices parciales de publicación (4 tablas existentes).
- [x] 1.3 Índices parciales soft delete (leads, projects, contacts).
- [x] 1.4 Índices BRIN (conversion_events, audit_logs, ai_token_usage, project_state_history).
- [x] 1.5 Índice GIN sobre leads.project_data.

## 2. Aplicar migración y validar

- [x] 2.1 Ejecutar `npx prisma validate`.
- [x] 2.2 Ejecutar `npx prisma migrate dev` (aplicar migración).
- [x] 2.3 Verificar índices en BD (`pg_indexes` o `\di`).

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Verificación BD: migración aplicada en Neon EU.
- [x] 3.3 Crear informe `openspec/changes/gtk-19-performance-indexes/reports/2026-07-23-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar que no se commitea `.env`.
- [x] 4.2 Crear `openspec/changes/gtk-19-performance-indexes/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Actualizar `docs/technical/data-model.md` §7 marcando índices como materializados.
- [x] 5.2 Delta spec `performance-indexes` creada en el change.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-19-performance-indexes/reports/code-review.md` con `Veredicto: APTO`.
