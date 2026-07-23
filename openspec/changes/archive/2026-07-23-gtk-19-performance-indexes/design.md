# Design — gtk-19-performance-indexes

> Variante Harness DB — índices SQL avanzados vía migración Prisma custom (sin cambios declarativos).

## Enfoque técnico

1. **Migración SQL-only:** Prisma no soporta índices parciales, BRIN ni GIN en el DSL declarativo; se añaden en el `.sql` de la migración generada con `--create-only`.
2. **Parciales de publicación:** filtran `workflow_status = 'publicado' AND deleted_at IS NULL` — alta selectividad para rutas ISR (`/[servicio]/`, geo-landings, intersección, casos de estudio).
3. **Parciales soft delete:** `WHERE deleted_at IS NULL` sobre CRM — listados nunca recorren filas suprimidas (RGPD).
4. **BRIN temporal:** tablas append-only ordenadas por inserción; ocupan KB frente a MB de btree a escala 12M.
5. **GIN jsonb_path_ops:** habilita filtros por claves en `leads.project_data` para reporting sin desnormalizar.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| SQL manual en migración | `@index` Prisma | Prisma no expresa parciales/BRIN/GIN |
| Índice en `slug` (parcial publicación) | Solo `workflow_status` | Resolución ISR filtra por slug + estado |
| BRIN en 4 tablas append-only | Solo btree existente | Escala 12M; BRIN ideal para rangos temporales |
| GIN `jsonb_path_ops` | GIN default ops | Menor tamaño; suficiente para filtros por clave |
| Omitir `blog_posts` | Crear tabla vacía | GTK-13 pendiente; índice se añade después |
| Sin `CONCURRENTLY` en dev | CONCURRENTLY siempre | Prisma migrate corre en transacción; greenfield sin bloqueo |

## Migración

- Nombre: `performance_partial_brin_gin_indexes`
- DDL: 12 `CREATE INDEX` (4 parciales publicación + 3 parciales soft delete + 4 BRIN + 1 GIN)
- Sin data migration
- Producción con datos: documentar `CREATE INDEX CONCURRENTLY` fuera de transacción Prisma

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | Índices sobre tablas con PII existente (`leads`, `projects`, `contacts`); no amplían superficie |
| Base legal | Sin cambio — heredada de GTK-12 |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | Índices parciales respetan exclusión de filas suprimidas |
| Append-only | BRIN no altera inmutabilidad de audit/conversion/token/history |
| IA / prompts | Sin impacto — no hay datos nuevos en prompts |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- Consulta `pg_indexes` confirma existencia de índices
- `npm run test`, `typecheck`, `lint` en verde
