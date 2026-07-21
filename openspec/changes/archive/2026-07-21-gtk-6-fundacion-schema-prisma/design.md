# Design — gtk-6-fundacion-schema-prisma

> Variante Harness DB — implementación en `prisma/schema.prisma` + `DIRECT_URL` en env.

## Enfoque técnico

1. **Datasource dual Neon:** `DATABASE_URL` apunta al pooler (runtime serverless); `DIRECT_URL` a la conexión directa (migraciones `prisma migrate`). Patrón recomendado por Neon + Prisma 6.
2. **Solo enums en esta migración:** Prisma genera `CREATE TYPE ... AS ENUM` sin tablas. Los modelos llegan en GTK-7+.
3. **Bloques como comentarios:** Prisma no soporta herencia; los bloques AUDIT/SEO/EDITORIAL se documentan en comentarios `///` y bloques `// ---` para copiar en tickets futuros.
4. **AUDIT sin FK a users:** `created_by_id` / `updated_by_id` serán `@db.Uuid` escalares sin `@relation` hacia `User`, evitando decenas de back-relations. Las FK de dominio (`author_id`, `role_id`, etc.) sí tendrán relación en sus tickets.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Prisma 6 con `directUrl` en schema | Prisma 7 + driver adapters | Consistencia con GTK-21; migración a P7 cuando haya más modelos |
| Enums nativos PostgreSQL | String + check constraints | Eficiencia y alineación con `data-model.md` |
| Sin modelos en GTK-6 | Incluir `provinces` u otros | Scope del ticket Linear; un change = un ticket DB |

## Migración

- Nombre: `[timestamp]_init_enums_and_datasource`
- DDL esperado: tres `CREATE TYPE` para los enums
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| Superficie de ataque | Baja: solo tipos ENUM, sin datos ni endpoints |
| PII | No aplica en este ticket |
| Región EU | Obligatoria — Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Acceso | Migraciones solo en CI/dev con credenciales de entorno |
| IA / prompts | Los enums no contienen PII ni se envían a Claude |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` (dev) o documentar bloqueo si no hay BD
- `npm run test` — suites env/db existentes en verde
- Actualizar delta specs; `data-model.md` ya documenta enums (sin cambio estructural)
