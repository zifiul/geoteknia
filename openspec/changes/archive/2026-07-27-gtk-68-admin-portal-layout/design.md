# Design — gtk-68-admin-portal-layout

## Enfoque

- **Rutas:** `app/(admin)/(portal)/layout.tsx` envuelve páginas autenticadas (`/admin`, `/admin/proyectos`, `/contenido`, `/ia`, `/perfil`). Login y forbidden quedan fuera del shell (`app/(admin)/admin/login`, `app/(admin)/admin/forbidden`).
- **Sesión:** `runWithPortalReadAccess` + `getPortalSession` en layout portal (espejo BD).
- **Nav:** `filterNavSectionsForRole(roleName)` usa `resolvePermissionCodesForRole` — sin listas hardcodeadas por rol.
- **Stitch:** sidebar 240px `bg-brand-primary` (Deep Basalt #1b2838), topbar con badge de rol y logout; referencia screens `91a50788…`, `2102aada…`, `b68bb4e7…`.
- **RoleGate:** lee `x-pathname` (middleware) y redirige a `/admin/forbidden` + `recordAccessDeniedAudit` (best-effort).
- **Cliente mínimo:** `AdminPortalShellClient` para colapso sidebar (`aria-expanded`, `min-h-dvh`).

## Threat model

### Superficie

- UI admin autenticada; navegación y rutas directas (`/contenido`, `/ia/...`).
- Logout (CSRF mitigado por Server Action + sesión).

### Actores

- Usuario autenticado con rol limitado (escalada horizontal entre módulos).
- Anónimo (middleware + layout).

### Datos sensibles

- Email en topbar; audit `access_denied` solo `userId`, ruta, rol (sin PII extra).

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Acceso a módulo sin permiso | `RoleGate` + redirect 403 + audit |
| T2 | Nav muestra enlaces no autorizados | Filtrado por permisos atómicos |
| T3 | Sesión revocada solo en JWT | `getPortalSession` espejo BD |
| T4 | Indexación admin | `robots` en `(admin)/layout` |
| T5 | GTM en portal | Sin script en route group admin |

### Criterios seguridad

- [ ] SEC-1: rutas portal exigen sesión válida en servidor.
- [ ] SEC-2: denegación registrada `access_denied` best-effort.
- [ ] SEC-3: logout invalida sesión Auth.js.

## Decisiones

- Componentes en `components/organisms/admin/` (Atomic Design, coherente con GTK-69).
- `access_denied` en enum Prisma.
