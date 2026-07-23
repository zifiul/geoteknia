# Design — gtk-17-master-seed

> Variante Harness DB (SEED) — `prisma/seed.ts` + datos canónicos en `/lib/`.

## Enfoque técnico

1. **Idempotencia:** upsert por `slug`, `code`, `name` o id fijo (`organization_profile`).
2. **RBAC:** matriz en `lib/auth/permissions.ts`; seed sincroniza `role_permissions` (añade y elimina excesos).
3. **Orden:** pipeline → RBAC → provincias → tipologías → plantillas → org → canales → calculadora → presupuesto IA.
4. **Placeholder:** datos corporativos y CTE marcados como pendientes de cliente.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Matriz RBAC en `/lib/` | Hardcode solo en seed | Fuente única para seed y autorización futura |
| Sync role_permissions | Solo createMany | Idempotencia ante cambios de matriz |
| UUID fijo org profile | Upsert por slug | Schema singleton sin slug |
| contact_channel por department | Upsert por id fijo | Enum department como clave natural de negocio |

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — datos corporativos placeholder |
| Región EU | Neon EU |
| Secretos | No incluir credenciales en seed |

## Verificación

- `npx prisma db seed` × 2 con conteos estables
- Tests unitarios RBAC y plantillas
- `npm run test`, `typecheck`, `lint`
