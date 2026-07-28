# Design — gtk-81-admin-users

## Enfoque

- **Rutas:** RSC en `app/(admin)/(portal)/admin/usuarios/**` con `runWithPortalReadAccess`; formularios/diálogos como client components mínimos.
- **Datos:** `lib/admin/users-queries.ts` (`listUsers`, `getUserDetail`) y `lib/admin/users-actions.ts` (create/update/active/reset password/reset 2FA) con `withPermission`.
- **Stitch:** proyecto `14512274866174259595` — listado `5f7c3fa5…`, crear `e941e5b2…`, editar `edbedcf8…`, modal éxito contraseña `32a04060…`. Layout: cabecera con título y CTA primario, tarjeta de filtros, tabla en `bg-brand-surface` con borde suave, formularios en panel centrado, modales Radix (`Dialog`).
- **Audit:** sin migración Prisma — ampliar `METADATA_WHITELIST.state_change` con `event`, `targetUserId`; eventos `user_created`, `activated`, `deactivated`, `password_reset`, `twofa_reset`. Cambio de rol: `role_change` existente.
- **Sesiones:** `revokeAllSessionsForUser(userId)` en `lib/auth/session.ts`, llamado tras cambio de rol y desactivación.

## Threat model

### Superficie

- Páginas `/admin/usuarios/**` y Server Actions de mutación.
- PII interna (`fullName`, `email`) en listado — solo `users.read`.

### Actores

- Usuario sin `users.*` (escalada vía URL o invocación directa de actions).
- Admin malicioso (auto-lockout, IDOR sobre `[id]`).

### Datos sensibles

- `passwordHash`, `twofaSecret` nunca al cliente; contraseña temporal solo en respuesta puntual post-alta/reset.
- Metadata audit sin email/nombre (whitelist + `sanitizeAuditMetadata`).

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Invocar action sin permiso | `withPermission` / `requirePermission` en queries y actions |
| T2 | IDOR en edición | Misma barrera RBAC; sin scoping por técnico — admin global |
| T3 | Lockout (0 admins) | Guardrails puros + tests |
| T4 | Sesión con rol obsoleto | `revokeAllSessionsForUser` en rol/desactivación |
| T5 | Fuga de secreto en audit/logs | Whitelist; sin PII en metadata |

### Criterios seguridad

- [ ] SEC-1: cada action exige permiso `users.create` o `users.update` según caso.
- [ ] SEC-2: guardrails último admin y auto-desactivación.
- [ ] SEC-3: sin `passwordHash`/`twofaSecret` en props cliente.
- [ ] SEC-4: audit must-audit en transacción con mutación.

## Decisiones

- Reutilizar `state_change`+`event` en lugar de nuevos enum `AuditAction` (sin migración).
- `deletedAt` ignorado en MVP listado (solo `isActive`); no borrado físico.
- Contrato Zod: `user-filters-schema.ts`, `user-form-schemas.ts` (fase 2); sin cambios en `api-spec.yml` (Server Actions).
