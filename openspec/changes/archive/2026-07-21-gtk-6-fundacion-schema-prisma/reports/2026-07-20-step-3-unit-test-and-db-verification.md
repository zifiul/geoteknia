# Informe — GTK-6 — tests unitarios y verificación BD

**Fecha:** 2026-07-20  
**Change:** `gtk-6-fundacion-schema-prisma`  
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
| `npx prisma validate` | ✅ Schema válido (con `DATABASE_URL` + `DIRECT_URL` en entorno) |
| `npx prisma generate` | ✅ Cliente generado |
| `npx prisma migrate dev` | ⚠️ **Bloqueado** — `.env` local no contiene `DATABASE_URL` ni `DIRECT_URL` (solo `STITCH_API_KEY`). Migración SQL creada manualmente en `prisma/migrations/20260720191700_init_enums_and_datasource/`. |

## Verificación BD (`db-state-verify`)

**No aplicable** para escritura: la migración no se aplicó a Neon (sin credenciales de BD en entorno local).

**DDL esperado** (verificado vía `prisma migrate diff --from-empty`):

```sql
CREATE TYPE "WorkflowStatus" AS ENUM (...);
CREATE TYPE "SchemaType" AS ENUM (...);
CREATE TYPE "AiModel" AS ENUM ('claude-sonnet-4-6', 'claude-opus-4-8');
```

## Acción requerida para CI/Neon

1. Añadir `DATABASE_URL` y `DIRECT_URL` al `.env` local (ver `.env.example`).
2. Ejecutar `npx prisma migrate deploy` en el branch de PR (Neon EU).

## Restauración

Sin operaciones CREATE/UPDATE/DELETE en BD real; no requiere restauración.
