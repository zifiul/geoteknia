# Proposal — gtk-68-admin-portal-layout

> US: [GTK-68 — Layout del portal /admin con RBAC, navegación por rol y aislamiento](https://linear.app/geoteknia/issue/GTK-68/layout-del-portal-admin-con-rbac-navegacion-por-rol-y-aislamiento)
> Diseño Stitch (comentario Linear 2026-07-20): proyecto `14512274866174259595`, DS `12797274562027555828` — shell admin `91a50788…`, gestor `2102aada…`, 403 `b68bb4e7…`.

## Why

El back-office necesita shell autenticado (sidebar Deep Basalt 240px, topbar con rol y logout), navegación derivada de `resolvePermissionCodesForRole()`, guardas de ruta en servidor y registro `access_denied` en audit log. Materializa RF-17 y RNF-ADMIN.

## What Changes

- Route group `(portal)` con layout RSC: sesión BD (`getPortalSession`), `RoleGate`, `AdminPortalShell` (Stitch).
- `lib/admin/nav-sections.ts` + reglas de acceso por pathname.
- Componentes `components/organisms/admin/`: `AdminSidebar`, `AdminTopbar`, `AdminPortalShell`, `RoleGate`.
- Migración Prisma `AuditAction.access_denied` + `recordAudit` best-effort al denegar.
- Landing `/admin` mínima por rol; `/admin/forbidden` con enlace de vuelta.
- `adminLogoutAction` con `signOut()`.
- Tests unit (nav, audit) y E2E (nav por rol, forbidden, GTM ausente, logout).

## Capabilities

### New Capabilities

- `admin-portal-layout`: shell RBAC del portal admin.

### Modified Capabilities

- (ninguna spec viva previa)

## Impact

- **Contrato:** omitido (logout vía Auth.js; sin Route Handlers nuevos).
- **QA:** E2E obligatorio (Feature / Admin).

## Fuera de alcance

- Dashboard KPIs (GTK-79), CRUD usuarios (GTK-81), ampliar middleware a rutas fuera de `/admin` (defensa en layout `(portal)`).
