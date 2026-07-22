# Informe — GTK-10 — tests unitarios y verificación BD

**Fecha:** 2026-07-22  
**Change:** `gtk-10-master-provinces-work-typologies`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 6/6 tests (env + db) |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma migrate dev --name master_provinces_work_typologies` | ✅ Migración creada y aplicada |
| `npx prisma generate` | ✅ Cliente generado con `Province` y `WorkTypology` |

## Criterios de aceptación GTK-10

| Criterio | Estado |
|----------|--------|
| `provinces.slug` único | ✅ |
| `work_typologies.slug` único | ✅ |
| `is_operational` default `false` | ✅ |
| Índice `provinces.is_operational` | ✅ |
| Bloque AUDIT en ambas tablas | ✅ |
| Sin seed (delegado a DB-14) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
