# Proposal — gtk-19-performance-indexes

> US: [GTK-19 — Índices de rendimiento: parciales, BRIN y GIN](https://linear.app/geoteknia/issue/GTK-19/indices-de-rendimiento-parciales-brin-y-gin-para-carga-mixta)
> Variante: **Harness DB** | Dependencias: GTK-12, GTK-14, GTK-18, GTK-20 (tablas existentes) | Desbloquea: FEAT-22, FEAT-16/17, FEAT-20

## Why

La carga mixta del sistema (lectura SEO masiva vía ISR + escritura de leads/eventos) necesita índices que Prisma no declara de forma nativa: parciales para publicación y soft delete, BRIN para tablas append-only temporales, y GIN para consultas sobre `project_data`. Materializa RNF-PERF/RNF-SEO §7 y las consideraciones de escala a 12M filas.

## What Changes

- Migración SQL-only `performance_partial_brin_gin_indexes` (sin cambios declarativos en `schema.prisma`).
- Índices parciales de publicación sobre `services`, `geo_zones`, `service_zone_pages` y `case_studies` (`slug WHERE workflow_status = 'publicado' AND deleted_at IS NULL`).
- Índices parciales soft delete sobre `leads`, `projects` y `contacts` (`created_at WHERE deleted_at IS NULL`).
- Índices BRIN sobre `conversion_events(occurred_at)`, `audit_logs(created_at)`, `ai_token_usage(created_at)` y `project_state_history(created_at)`.
- Índice GIN `jsonb_path_ops` sobre `leads.project_data`.

## Capabilities

### New Capabilities

- `performance-indexes`: índices SQL avanzados (parciales, BRIN, GIN) para consultas ISR, CRM y reporting.

### Modified Capabilities

- Ninguna (solo DDL de índices sobre tablas existentes).

## Impact

- **Código:** migración SQL en `prisma/migrations/`.
- **BD:** ~12 índices nuevos en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** índices sobre tablas con PII existente; no introduce columnas nuevas.
- **Tickets desbloqueados:** FEAT-22 (ISR eficiente), FEAT-16/17 (CRM), FEAT-20 (reporting IA).

## Fuera de alcance

- Índice parcial sobre `blog_posts` — tabla aún no materializada (GTK-13); se añadirá en ticket posterior.
- `CREATE INDEX CONCURRENTLY` en producción (documentado para deploy manual si hay datos).
- Particionado temporal de tablas append-only.
