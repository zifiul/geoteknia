# Code review — gtk-68-admin-portal-layout

**Fecha:** 2026-07-27

## Alcance

Layout portal `(portal)`, RBAC nav, RoleGate, audit `access_denied`, componentes Stitch (Deep Basalt 240px).

## Checklist

- [x] Atomic Design (`components/organisms/admin/`)
- [x] Sesión servidor (`getPortalSession`, espejo BD)
- [x] Nav derivada de permisos, no hardcode por rol
- [x] `security.md` limpio
- [x] Tests unit + E2E verdes en agente

## Seguridad

- RoleGate + audit best-effort; middleware ampliado a rutas CMS internas.
- Forbidden sin shell; login fuera de `(portal)`.

**Veredicto: APTO**
