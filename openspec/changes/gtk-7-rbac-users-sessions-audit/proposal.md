# Proposal — gtk-7-rbac-users-sessions-audit

> US: [GTK-7 — RBAC, usuarios, sesiones y registro de auditoría](https://linear.app/geoteknia/issue/GTK-7/rbac-usuarios-sesiones-y-registro-de-auditoria)
> Variante: **Harness DB** | Dependencias: GTK-6 (fundación enums) | Desbloquea: entidades con bloque AUDIT, DB-14 (seed RBAC)

## Why

Toda entidad con bloque AUDIT referencia `users` para autoría técnica y el RBAC condiciona quién puede operar en `/admin`. Sin `roles`, `permissions`, `users`, `sessions` y `audit_logs`, no hay identidad ni trazabilidad (RF-17, RNF-ADMIN).

## What Changes

- Añadir enums `RoleName` y `AuditAction` en `prisma/schema.prisma`.
- Crear modelos: `Role`, `Permission`, `RolePermission`, `User`, `Session`, `AuditLog`.
- Migración `rbac_users_sessions_audit` con tablas, índices y FKs según ticket Linear.
- Sin seed (llega en DB-14); sin lógica en `/lib`.

## Capabilities

### New Capabilities

- `rbac-identity-audit`: núcleo de identidad, RBAC y auditoría append-only del portal interno.

### Modified Capabilities

- Ninguna (fundación GTK-6 intacta).

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** seis tablas + dos enums en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** PII interna en `users`; datos de conexión en `sessions`/`audit_logs`; credenciales hasheadas/cifradas.
- **Tickets desbloqueados:** entidades de dominio con `created_by_id`, DB-14 (seed roles/permisos).

## Fuera de alcance

- Seed de roles/permisos (DB-14).
- Auth.js, login, 2FA (US funcional posterior).
- Índices avanzados BRIN en `audit_logs` (DB-15).
