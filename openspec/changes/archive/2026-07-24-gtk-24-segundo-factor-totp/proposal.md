# Proposal — gtk-24-segundo-factor-totp

> US: [GTK-24 — Segundo factor de autenticación (TOTP) del portal](https://linear.app/geoteknia/issue/GTK-24/segundo-factor-de-autenticacion-totp-del-portal)
> Dependencias: GTK-23 (auth credenciales + hook TOTP, ✅), GTK-22 (audit log, ✅), GTK-7 (campos `twofa_*` en User, ✅) | Desbloquea: login 2FA operativo, endurecimiento `/admin`

## Why

El portal `/admin` gestiona PII y acciones sensibles; la arquitectura exige 2FA recomendado (RF-17, RNF-ADMIN). GTK-23 dejó el gating de login y el punto de extensión `verifyTotp` en modo fail-closed: usuarios con `twofa_enabled=true` no pueden entrar hasta registrar el verificador real. Este cambio materializa TOTP (enrolamiento, confirmación, login y desactivación con reautenticación) y la página de autogestión en perfil.

## What Changes

- Implementar criptografía TOTP (`otplib`) y cifrado AES-256-GCM del secreto en reposo (`TWOFA_ENCRYPTION_KEY`).
- Registrar verificador real en el hook de GTK-23 (`lib/auth/totp-verifier.ts`, import en `config.ts`).
- Server Actions de enrolamiento/activación/desactivación (`lib/auth/totp-actions.ts`) con sesión válida (`getPortalSession`).
- Página `/admin` de seguridad: `app/(admin)/perfil/seguridad/` (Server + Client para QR y código de 6 dígitos).
- Ampliar whitelist de auditoría `role_change` con `metadata.event` (`2fa_enabled` / `2fa_disabled`).
- Añadir `TWOFA_ENCRYPTION_KEY` a `lib/env.ts` y `.env.example`.
- Tests unitarios/integración y QA harness (curl de flujos de acciones, E2E login con 2FA).

## Capabilities

### New Capabilities

- `portal-auth-totp`: generación y verificación TOTP, cifrado del secreto, verificador de login, Server Actions de gestión 2FA y UI mínima de enrolamiento.

### Modified Capabilities

- `portal-auth-credentials`: login con `twofa_enabled=true` exige código TOTP válido cuando el verificador está registrado (comportamiento efectivo tras GTK-24).
- `env-validation`: variable `TWOFA_ENCRYPTION_KEY` (32 bytes en hex).
- `audit-log-service`: metadata `event` permitida en acción `role_change` para sub-eventos de seguridad 2FA.

## Impact

- **Código:** `lib/auth/totp-core.ts`, `crypto.ts`, `totp-verifier.ts`, `totp-actions.ts`; import en `config.ts`; `lib/audit/sanitize.ts`; `app/(admin)/perfil/seguridad/*`; export `totpCodeSchema` en login-schemas.
- **BD:** sin migración (reutiliza `users.twofa_enabled` / `twofa_secret`). Escrituras en `users` y `audit_logs` (`role_change`).
- **API:** sin Route Handler nuevo; Server Actions internas del portal (contrato Zod en fase 2).
- **Dependencias:** `qrcode` (data-URL del QR solo durante enrolamiento); `otplib` ya presente.
- **RGPD / seguridad `/admin`:** secreto TOTP cifrado en reposo; nunca en logs/respuestas tras activación; QR/URI solo en enrolamiento pendiente; desactivación con contraseña + TOTP; audit must-audit en transacción.
- **SEO:** sin impacto (ruta admin `noindex`).

## Fuera de alcance

- Rate limiting de intentos TOTP — **GTK-26**.
- UI de login con paso TOTP visible en `/admin/login` — **GTK-69** (el campo `totp` en schema ya existe para callback/action).
- Cambios de schema Prisma o permisos RBAC adicionales (gestión self-service con sesión válida).
- Sobrescribir `lib/auth/totp.ts` (punto de extensión de GTK-23).
- Modificar `authorize()`, `authenticate-credentials.ts` ni `login-schemas` salvo export reutilizable de `totpCodeSchema`.
