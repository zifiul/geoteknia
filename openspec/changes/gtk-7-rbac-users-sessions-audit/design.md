# Design — gtk-7-rbac-users-sessions-audit

> Variante Harness DB — modelos RBAC + identidad + auditoría en `prisma/schema.prisma`.

## Enfoque técnico

1. **Enums nativos:** `RoleName` (4 roles) y `AuditAction` (9 acciones) como tipos PostgreSQL.
2. **RBAC M:N:** `role_permissions` con PK compuesta y `onDelete: Cascade` desde roles/permissions.
3. **Usuario → Rol:** FK `users.role_id` con `onDelete: Restrict` (no borrar rol con usuarios activos).
4. **Append-only:** `Session` y `AuditLog` sin `updated_at`/`deleted_at`; revocación vía `revoked_at`.
5. **AUDIT sin FK a users:** `created_by_id`/`updated_by_id` en `Role`/`Permission`/`User` permanecen escalares (decisión GTK-6).

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `audit_logs.user_id` ON DELETE SET NULL | CASCADE | Preservar trazabilidad si se elimina usuario |
| `sessions` CASCADE al borrar user | SET NULL | Sesiones huérfanas sin sentido operativo |
| `users.role_id` RESTRICT | CASCADE | Evitar borrado accidental de roles en uso |
| Sin seed en GTK-7 | Incluir roles maestros | Scope del ticket; DB-14 dedicado |

## Migración

- Nombre: `20260722160230_rbac_users_sessions_audit`
- DDL: 2 enums, 6 tablas, índices únicos/compuestos, 5 FKs
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | `users.full_name`, `users.email`; `sessions`/`audit_logs` IP y user-agent |
| Credenciales | `password_hash` (argon2/bcrypt), `twofa_secret` (cifrado en reposo — impl. futura) |
| Base legal | Relación laboral (empleados); interés legítimo (seguridad) para logs de conexión |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Append-only | `audit_logs` inmutable; `sessions` revocables con `revoked_at` |
| IA / prompts | Sin PII en prompts (RNF-IA) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
