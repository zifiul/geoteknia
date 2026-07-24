# Proposal — gtk-25-rbac-capa-autorizacion

> US: [GTK-25 — RBAC: capa de autorización para Route Handlers y Server Actions](https://linear.app/geoteknia/issue/GTK-25/rbac-capa-de-autorizacion-para-route-handlers-y-server-actions)
> Dependencias: GTK-23 (sesión, ✅ implementado) | GTK-24 (2FA, ✅ implementado, sin impacto) | GTK-7/GTK-17 (catálogo y matriz de permisos, ✅ implementados) | Desbloquea: tickets de módulos (proyectos, contenido, IA, usuarios) que consumirán `withPermission`/`withRoutePermission`

## Why

Los cuatro roles del portal (`admin`, `gestor`, `editor`, `tecnico`) tienen alcances distintos sobre proyectos, contenido, IA y usuarios, y el rol `tecnico` solo debe operar sobre sus proyectos asignados. Hoy existe el catálogo de permisos y la matriz rol→permiso (`lib/auth/permissions.ts`, GTK-7/GTK-17) y la sesión verificable en BD (`lib/auth/session.ts`, GTK-23), pero no existe la primitiva que las conecta: una comprobación de autorización reutilizable que los futuros Server Actions y Route Handlers puedan invocar antes de ejecutar cualquier caso de uso. Esta US materializa esa capa (RF-17, RNF-ADMIN).

## What Changes

- Crear `lib/auth/rbac-errors.ts` con `ForbiddenError extends Error` (403). Reutilizar `InvalidSessionError` (ya en `lib/auth/session.ts`) para 401.
- Modificar `lib/auth/session.ts` para añadir `getPortalSession()`: wrapper cableado de cero argumentos que provee `getAuthSession`/`findSessionMirror` reales a `requireSession(deps)`, de modo que la autorización sí comprueba revocación/expiración en BD (no solo el JWT de `getServerSession()`).
- Modificar `lib/auth/config.ts` (`session()` callback) para exponer `sessionTokenHash` en `session.user` — descubierto durante TDD-RED: `getPortalSession()` necesita el `tokenHash` para consultar el espejo en `sessions`, y hoy el callback no lo expone fuera del `jwt()` interno.
- Crear `lib/auth/rbac.ts` con:
  - `can(user, permissionCode)`: resuelve en memoria con `resolvePermissionCodesForRole(user.roleName)`, sin consultar `role_permissions` en runtime.
  - `requirePermission(permissionCode)`: cablea `getPortalSession()` → `InvalidSessionError` (401) si no hay sesión válida; `ForbiddenError` (403) si no tiene el permiso.
  - `assertOwnership(resource, user)`: no-op para `admin`/`gestor`; para `tecnico` exige `resource.assignedTechnicianId === user.userId`, si no `ForbiddenError`.
  - `withPermission(code, handler)`: wrapper para Server Actions.
  - `withRoutePermission(code, handler)`: wrapper para Route Handlers, devuelve 401/403 con cuerpo `{ success: false, error: { code, message } }` sin ejecutar el handler de negocio en caso de denegación.
- Modificar `lib/auth/index.ts` para exportar `./rbac` (y lo público de `./session` que otros módulos necesiten).
- Tests unitarios Vitest: matriz `can()` para los 4 roles × 17 permisos, `assertOwnership`, `requirePermission` (401/403/pasa), `withPermission`/`withRoutePermission` (no ejecutan el handler ni escriben audit log cuando deniegan).

## Capabilities

### New Capabilities

- `rbac-authorization`: primitiva de autorización (permiso atómico + pertenencia de recurso) consumida por Server Actions y Route Handlers del portal.

### Modified Capabilities

Ninguna (`rbac-identity-audit` ya define el modelo de roles/permisos; `portal-auth-credentials` ya define la sesión — esta US solo añade un wrapper cableado sobre `requireSession` existente, sin cambiar su contrato).

## Impact

- **Código:** `lib/auth/rbac.ts`, `lib/auth/rbac-errors.ts`, `lib/auth/session.ts` (añade `getPortalSession`), `lib/auth/index.ts`. Tests en `tests/unit/auth/**`.
- **BD:** ningún cambio de schema (reutiliza `sessions`, `role_permissions` ya materializados).
- **API / UI:** ninguno directo — sin Route Handlers ni Server Actions de negocio propios. Fase de contrato (2) omitida: no hay endpoint que declarar en `api-spec.yml`.
- **RGPD:** no maneja PII; refuerza anti-enumeración (denegación no filtra existencia del recurso).
- **Tickets desbloqueados:** módulos de proyectos, contenido, IA y usuarios, que importarán `withPermission`/`withRoutePermission` para proteger sus propios Server Actions y Route Handlers.

## Fuera de alcance

- Route Handlers o Server Actions de negocio bajo `app/(admin)/**` (los crean los tickets de cada módulo).
- Cambios en `lib/auth/permissions.ts` (catálogo/matriz), salvo que negocio pida excluir `content.publish` de `editor` (cambio de una línea, no incluido aquí).
- Helper de respuesta HTTP compartido (`okJson`/`problemJson`): no existe en el repo; se documenta como gap, `withRoutePermission` usa un cuerpo mínimo propio.
- E2E Playwright: no hay caso de uso real bajo `app/(admin)/**` todavía; se documenta como bloqueado.
