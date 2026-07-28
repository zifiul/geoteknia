# Proposal — gtk-81-admin-users

**Linear:** [GTK-81](https://linear.app/geoteknia/issue/GTK-81) — Gestión de usuarios del portal (listado, alta, edición y activación por rol Admin).

## Qué

Implementar `/admin/usuarios` (listado paginado con filtros en URL), alta en `/admin/usuarios/nuevo`, ficha/edición en `/admin/usuarios/[id]`, Server Actions gateadas por `users.*`, guardrails de último administrador, revocación de sesiones tras cambio de rol/desactivación, y audit log (`role_change` + `state_change` con `event`).

## Por qué

Cierra el enlace roto del nav (GTK-68), materializa RF-17 y enlaces del dashboard (GTK-79). Reutiliza permisos atómicos existentes, modelo `User` sin migración y diseño Stitch Oleada A2.

## Alcance

- In: queries/actions, UI `components/organisms/admin/users/**`, tests unit/E2E, extensión whitelist audit `state_change`.
- Out: matriz `role_permissions`, SSO, invitación por email, `users.delete` físico.

## Impacto

- Rutas nuevas bajo `app/(admin)/(portal)/admin/usuarios/**`.
- `lib/auth/session.ts`: `revokeAllSessionsForUser`.
- Sin Route Handlers públicos nuevos; contrato = schemas Zod en `lib/admin/user-*`.
