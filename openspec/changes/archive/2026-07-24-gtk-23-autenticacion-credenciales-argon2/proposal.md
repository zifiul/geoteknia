# Proposal — gtk-23-autenticacion-credenciales-argon2

> US: [GTK-23 — Autenticación del portal con Auth.js v5 (credenciales + argon2)](https://linear.app/geoteknia/issue/GTK-23/autenticacion-del-portal-con-authjs-v5-credenciales-argon2)
> Dependencias: GTK-7 (modelo User/Session/Role), GTK-21 (next-auth + argon2), GTK-22 (audit log) | Desbloquea: GTK-24, GTK-25, GTK-26, GTK-68, GTK-69

## Why

El back-office `/admin` gestiona PII de leads/proyectos y debe restringirse a usuarios internos. Hace falta el backend de autenticación (FEAT-04 / RF-17 / RNF-ADMIN): credenciales con argon2id, sesiones JWT con espejo revocable en BD y auditoría de login, sin UI ni TOTP todavía.

## What Changes

- Configurar Auth.js v5 con proveedor `Credentials` (email + contraseña) en `lib/auth/config.ts`.
- Implementar `hashPassword` / `verifyPassword` con argon2id en `lib/auth/passwords.ts`.
- Persistir espejo de sesión en `sessions` (`token_hash`, `expires_at`, `ip_address`, `user_agent`) y comprobar revocación/expiración en callbacks.
- Exponer `getServerSession()` / `requireSession()` tipados (`userId`, `roleId`, `roleName`).
- Exponer Server Action `loginAction` (schema Zod) para consumo futuro por GTK-69.
- Añadir handler `app/api/auth/[...nextauth]/route.ts`.
- Añadir `SESSION_TTL_MINUTES` a `lib/env.ts`.
- Registrar `login` / `login_failed` vía `recordAudit` (GTK-22); actualizar `last_login_at` en login OK.
- Punto de extensión TOTP: si `twofa_enabled` y no hay verificador, el login falla (sin bypass).

## Capabilities

### New Capabilities

- `portal-auth-credentials`: autenticación del portal con Auth.js v5 (Credentials + argon2id), sesión JWT con espejo revocable en BD, helpers de sesión y Server Action de login.

### Modified Capabilities

- `env-validation`: añadir validación de `SESSION_TTL_MINUTES` (entero positivo) al schema de `lib/env.ts`.

## Impact

- **Código:** `lib/auth/config.ts`, `passwords.ts`, `session.ts`, `login-action.ts`; `app/api/auth/[...nextauth]/route.ts`; `lib/env.ts`. No tocar `lib/auth/permissions.ts` / `index.ts` RBAC existentes salvo reexport si hace falta.
- **BD:** sin migración (reutiliza GTK-7). Escrituras en `sessions`, `users.last_login_at`, `audit_logs`.
- **API:** rutas Auth.js `/api/auth/*` + Server Action `loginAction` (contrato en fase 2).
- **UI:** ninguna (GTK-69).
- **RGPD / seguridad `/admin`:** credenciales nunca en claro ni en logs; hash argon2id; sesiones revocables; audit best-effort de login.
- **Tickets desbloqueados:** GTK-24 (TOTP), GTK-25 (RBAC handlers), GTK-26 (rate limit/middleware), GTK-68/69 (layout/login UI).

## Fuera de alcance

- Página/formulario de login y paso TOTP visible (`app/(admin)/login/`) — **GTK-69**.
- Generación/validación TOTP, QR, enrolamiento — **GTK-24** (solo hook inyectable aquí).
- Rate limiting de login, middleware de `/admin`, cabeceras `noindex` — **GTK-26**.
- Servicio de audit log — ya en **GTK-22** (solo consumo).
- Cambios de schema Prisma / migración.
