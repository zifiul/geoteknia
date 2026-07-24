# Design — gtk-24-segundo-factor-totp

> TOTP 2FA del portal `/admin`: verificador real, cifrado en reposo, gestión self-service y auditoría.

## Context

- GTK-23 implementó login, hook `registerVerifyTotp` / `verifyTotp` en `lib/auth/totp.ts` y gating en `authenticate-credentials.ts` (fail-closed sin verificador).
- GTK-7 ya tiene `users.twofa_enabled` y `users.twofa_secret` (texto cifrado en reposo).
- GTK-22 provee `recordAudit`; `role_change` es must-audit (fallo revierte transacción con `{ tx }`).
- `loginInputSchema` ya admite `totp` opcional de 6 dígitos; **no** se modifica el flujo de `authorize()` salvo import del verificador.
- Parte del código puede existir en la rama de feature antes de cerrar Gate 1; este diseño es la fuente de verdad para contrato, tests y QA.

## Goals / Non-Goals

**Goals:**

- Enrolamiento TOTP (QR + confirmación) y activación con `twofa_enabled=true` solo tras código válido.
- Login operativo con 2FA al registrar verificador que lee secreto cifrado de BD.
- Desactivación con reautenticación (contraseña + TOTP) y audit distinguible.
- Secreto nunca expuesto al cliente tras activación; cifrado AES-256-GCM con clave de entorno.
- Página `app/(admin)/perfil/seguridad/` noindex, mobile-friendly mínimo.

**Non-Goals:**

- Rate limit de intentos TOTP (GTK-26).
- UI de login GTK-69 (solo consumo del campo `totp` existente).
- Migración Prisma o permisos RBAC nuevos.
- Reemplazar `lib/auth/totp.ts` (extensión GTK-23).

## Decisions

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `totp-core.ts` separado de `totp.ts` | Sobrescribir `totp.ts` | GTK-23 reservó el fichero para el registro fail-closed |
| Registro del verificador por import en `config.ts` | Registro perezoso en primer login | Evita ventana fail-closed tras cold start |
| AES-256-GCM + `TWOFA_ENCRYPTION_KEY` hex 64 | Secreto en claro en BD | RGPD / RNF-ADMIN; patrón sin helper previo en `/lib` |
| Server Actions en `lib/auth/totp-actions.ts` | Route Handlers REST | Mutación interna del portal (`backend-standards` §5.2) |
| Audit `role_change` + `metadata.event` | Nuevo valor enum `AuditAction` | Sin migración; whitelist ampliada en `sanitize.ts` |
| `epochTolerance: 30` (±1 periodo) | Solo periodo exacto | Tolerar desfase de reloj del móvil |
| QR como data-URL vía `qrcode` en servidor | Librería QR en cliente | Solo durante enrolamiento; reduce bundle cliente |
| Self-service con `getPortalSession()` | Permiso RBAC adicional | El usuario gestiona su propia cuenta con sesión válida |

### Módulos

```text
lib/auth/totp-core.ts     → generateTotpSecret, verifyTotpCode (otplib)
lib/auth/crypto.ts        → encryptSecret / decryptSecret (env key)
lib/auth/totp-verifier.ts → VerifyTotpFn + registerVerifyTotp (server-only)
lib/auth/totp-actions.ts  → generate / confirm / disable (Zod + audit + tx)
lib/auth/config.ts        → import '@/lib/auth/totp-verifier' (side effect)
app/(admin)/perfil/seguridad/ → page.tsx + totp-setup-form.tsx
```

### Flujos

**Enrolamiento:** sesión válida → `generateTotpSecretAction` → guarda `twofa_secret` cifrado, `twofa_enabled=false` → cliente muestra QR → `confirmTotpActivationAction` → verifica código → TX: `twofa_enabled=true` + audit `2fa_enabled`.

**Login:** sin cambios en `authorize`; con verificador registrado, `authenticateCredentials` exige `totp` si `twofa_enabled`.

**Desactivación:** `disableTotpAction` → verify password + `verifyTotp` → TX: limpia secreto, `twofa_enabled=false` + audit `2fa_disabled`.

### Contrato Zod (fase 2 — congelado)

| Acción / endpoint | Schema Zod | Authz | Rate limit | SEC-N |
|---|---|---|---|---|
| `POST /api/auth/callback/credentials` | `credentialsCallbackBodySchema` | público | GTK-26 | SEC-1, SEC-2, SEC-6 |
| `loginAction` | `loginInputSchema` → `loginActionResultSchema` | público | GTK-26 | SEC-1, SEC-2, SEC-6 |
| `generateTotpSecretAction` | (sin input) → `generateTotpSecretActionResultSchema` | sesión portal (`getPortalSession`) | GTK-26 | SEC-2, SEC-6 |
| `confirmTotpActivationAction` | `confirmTotpActivationInputSchema` → `totpVoidActionResultSchema` | sesión portal | GTK-26 | SEC-2, SEC-3, SEC-5, SEC-6 |
| `disableTotpAction` | `disableTotpInputSchema` → `totpVoidActionResultSchema` | sesión portal | GTK-26 | SEC-2, SEC-4, SEC-5, SEC-6 |

Módulo canónico: `lib/auth/totp-schemas.ts`. Documentación HTTP/acciones: `docs/technical/api-spec.yml` (`x-geoteknia-serverActions` + `LoginInput.totp`).

**Congelación:** 2026-07-24 — ver `reports/2026-07-24-phase-2-contract-freeze.md`.

### Contrato Zod (detalle campos)

- Reutilizar `totpCodeSchema` exportado desde `login-schemas.ts` (6 dígitos).
- `confirmTotpActivationAction`: `{ totp }` estricto.
- `disableTotpAction`: `{ password: min 8, totp }` estricto.
- Resultados discriminados `{ ok: true } | { ok: false, error: { code, message } }` (sin secretos en respuestas).

## Threat model

### Superficie de ataque

- Server Actions `generateTotpSecretAction`, `confirmTotpActivationAction`, `disableTotpAction`.
- Login existente `/api/auth/callback/credentials` y `loginAction` (campo `totp`).
- Página cliente de enrolamiento (QR, inputs de código y contraseña).
- Persistencia `users.twofa_secret` y lectura en verificador.

### Actores

- Anónimo (sin sesión) intentando invocar acciones de gestión 2FA.
- Usuario autenticado (cualquier rol) sobre su propia cuenta.
- Atacante con sesión robada intentando desactivar 2FA o enrolar otro dispositivo.
- Atacante en login con credenciales robadas probando códigos TOTP.

### Datos sensibles implicados

- Secreto TOTP (alto): equivalente a segundo factor; cifrado en reposo; nunca en logs/audit/metadata.
- URI `otpauth://` y QR (medio): solo durante enrolamiento pendiente.
- Contraseña en `disableTotpAction` (alto): solo en tránsito HTTPS, verificación argon2, no persistir.
- Códigos TOTP de un solo uso (medio): ventana corta; no registrar en audit.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Bypass 2FA en login | Desactivar verificador o no registrar | Alto | Import obligatorio en `config`; fail-closed en GTK-23 |
| T2 | Exfiltración de secreto | Respuesta de action o logs | Alto | Secreto solo cifrado en BD; QR/URI solo en enrolamiento; sanitize audit |
| T3 | Activación sin posesión del dispositivo | Confirmar sin código válido | Alto | `twofa_enabled` solo tras `verifyTotpCode` |
| T4 | Desactivación sin reauth | Solo sesión robada | Alto | Exigir password + TOTP; audit must-audit |
| T5 | Gestión 2FA sin sesión | Llamada directa a Server Action | Alto | `getPortalSession()` + espejo BD |
| T6 | Brute force TOTP | Muchos códigos en login/confirm | Medio | Ventana corta; rate limit GTK-26 (documentado) |
| T7 | Manipulación ciphertext | Alterar `twofa_secret` en BD | Medio | GCM auth tag; verificación falla cerrada |
| T8 | Clave de cifrado débil/filtrada | `.env` comprometido | Alto | `TWOFA_ENCRYPTION_KEY` 32 bytes random; server-only env |

### Amenazas descartadas

- **Turnstile en acciones internas:** portal autenticado, no formulario público.
- **Escalada RBAC:** no hay cambio de rol; solo flags 2FA del propio usuario.
- **PII de leads en este flujo:** no se accede a tablas CRM.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Con `twofa_enabled=true` y verificador registrado, login sin `totp` válido falla con mensaje genérico y `login_failed`.
- [ ] SEC-2: Ninguna respuesta de Server Action ni `audit_logs.metadata` contiene `twofa_secret` en claro ni URI `otpauth` tras activación.
- [ ] SEC-3: `confirmTotpActivationAction` no pone `twofa_enabled=true` si el código TOTP es inválido.
- [ ] SEC-4: `disableTotpAction` no desactiva 2FA sin contraseña correcta y TOTP válido.
- [ ] SEC-5: Activación/desactivación persisten audit `role_change` con `metadata.event` `2fa_enabled` / `2fa_disabled` no nulo (whitelist).
- [ ] SEC-6: Server Actions de gestión rechazan invocación sin sesión portal válida (espejo BD).
- [ ] SEC-7: Fallo al escribir audit en activación/desactivación revierte la transacción de negocio (must-audit).

## Risks / Trade-offs

- [Risk] Implementación adelantada respecto al harness → Mitigación: retroactivar informes TDD/QA y `/opsx:verify` antes de archive.
- [Risk] Sin rate limit hasta GTK-26 → Mitigación: abuse cases documentados; SEC-6 parcial.
- [Risk] Dependencia `qrcode` → Mitigación: SCA en fase 5b; uso solo servidor.

## Migration Plan

- Añadir `TWOFA_ENCRYPTION_KEY` a entornos (generar `openssl rand -hex 32`).
- Sin migración de datos: usuarios sin 2FA no afectados.
- Usuarios con `twofa_enabled=true` previos (si existieran en datos de prueba) requieren verificador para login.

## Open Questions

- Ninguna bloqueante para Gate 1. Rate limit de confirmación/desactivación queda en GTK-26.
