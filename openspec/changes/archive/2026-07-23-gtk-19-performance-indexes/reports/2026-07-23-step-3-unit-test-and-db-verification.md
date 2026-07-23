# Informe — GTK-19 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-19-performance-indexes`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 13/13 tests |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma migrate dev` | ✅ Migración `20260723150546_performance_partial_brin_gin_indexes` aplicada |
| `npx prisma generate` | ✅ Cliente regenerado |

## Criterios de aceptación GTK-19

| Criterio | Estado |
|----------|--------|
| Índices parciales publicación (4 tablas existentes) | ✅ |
| Índices parciales soft delete (leads, projects, contacts) | ✅ |
| BRIN en conversion_events, audit_logs, ai_token_usage | ✅ |
| BRIN en project_state_history | ✅ |
| GIN en leads.project_data | ✅ |
| EXPLAIN usa índice parcial (no Seq Scan) | ✅ Index Only Scan on `idx_services_published` |
| blog_posts diferido (GTK-13) | ✅ Documentado |

## Verificación índices (`pg_indexes`)

12 índices `idx_*` confirmados en Neon EU:

- `idx_services_published`, `idx_geo_zones_published`, `idx_service_zone_pages_published`, `idx_case_studies_published`
- `idx_leads_active`, `idx_projects_active`, `idx_contacts_active`
- `idx_conversion_events_occurred_brin`, `idx_audit_logs_created_brin`, `idx_ai_token_usage_created_brin`, `idx_project_state_history_created_brin`
- `idx_leads_project_data_gin`

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE INDEX); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
