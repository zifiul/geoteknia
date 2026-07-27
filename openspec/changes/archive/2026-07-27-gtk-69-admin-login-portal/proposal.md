# Proposal — gtk-69-admin-login-portal

> US: [GTK-69 — Login del portal con credenciales y 2FA (TOTP)](https://linear.app/geoteknia/issue/GTK-69/login-del-portal-con-credenciales-y-2fa-totp)
> Diseño Stitch (comentario Linear 2026-07-20): proyecto `14512274866174259595`, DS `12797274562027555828` — login desktop `d1a0adba694647da94a285bdfb9d02d6`, error/rate limit `bca513c0aa224908a8a516715debfb22`, TOTP referencia visual `2dda61a46ddb4d2f8db37227a1a29626` (Opción A: campo opcional en un solo paso).

## Why

El back-office `/admin` requiere UI de login que consuma `loginAction` (GTK-23) con soporte TOTP (GTK-24), rate limit de login (GTK-26) y diseño admin Stitch (split-panel, logo Geoteknius). Materializa RF-17 y RNF-ADMIN en la capa de presentación.

## What Changes

- Página RSC `/admin/login` con `metadata.robots: noindex,nofollow`, lectura de `callbackUrl` y `error`.
- `LoginForm` (Client): email, contraseña, TOTP opcional visible (Opción A / SEC-1), validación con `loginInputSchema`, consumo de `loginAction`.
- `AdminAuthShell`: layout auth split-panel alineado a Stitch Oleada A1 (sin sidebar).
- Extensión mínima de `loginAction`: `checkRateLimit` por IP (`RATE_LIMITED`).
- Exención de middleware para `/admin/login` (sin sesión).
- Tests unitarios (validación cliente, rate limit action, callback URL) y E2E Playwright (feliz, 2FA, mensaje genérico, rate limit).
- Lighthouse: accesibilidad ≥ 95 en `/admin/login` (verificación en E2E o LHCI local).

## Decisiones de producto / seguridad

- **Flujo 2FA:** Opción A — un solo paso; no distinguir TOTP vs contraseña en UI (coherente con `loginAction` actual).
- **Enrolamiento 2FA (QR):** fuera de alcance (GTK-24 en `/perfil/seguridad`).
- **Turnstile:** no en login interno.

## Capabilities

### New Capabilities

- `admin-login-page`: página y formulario de login del portal admin.

### Modified Capabilities

- (ninguna spec viva — contrato login ya en GTK-23)

## Impact

- **Contrato:** reutiliza `loginInputSchema`; solo produce `RATE_LIMITED` ya declarado en schema.
- **Middleware:** permite acceso anónimo a `/admin/login`.
- **QA:** E2E obligatorio (label `Feature` / frontend admin).

## Fuera de alcance

- Opción B (`TOTP_REQUIRED`); enrolamiento QR; cambios en `authenticate-credentials.ts` / `authorize()`.
