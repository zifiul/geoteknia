# Code Review — gtk-24-segundo-factor-totp

- Fecha: 2026-07-24
- Diff revisado: `main` + working tree (~28 ficheros; sin commits en `main..HEAD`)
- Evidencia revisada: `2026-07-24-step-6-unit-test-and-db-verification.md`, `2026-07-24-step-7-server-action-verification.md`, `2026-07-24-step-8-playwright-e2e-verification.md`, `security.md`, `design.md` (threat model SEC-1…SEC-7), `tasks.md`

## Alineación spec ↔ implementación

| Requisito (design / delta spec) | Implementación | Evidencia |
|--------------------------------|----------------|-----------|
| Verificador TOTP registrado vía side-effect en `config.ts` | `lib/auth/totp-verifier.ts` + import en `config.ts` | Unit `totp-verifier`, QA login HTTP |
| Cifrado AES-256-GCM en reposo | `lib/auth/crypto.ts` + `TWOFA_ENCRYPTION_KEY` | Unit `crypto`, env schema |
| Enrolamiento: secreto cifrado, activación solo con código válido | `generateTotpSecretAction` / `confirmTotpActivationAction` | Unit + QA BD |
| Login sin cambiar `authorize`; gating en `authenticateCredentials` | GTK-23 + `verifyTotp` | Unit `authenticate-credentials` |
| Desactivación password + TOTP + audit | `disableTotpAction` + TX audit | Unit SEC-4, QA BD |
| Contrato Zod congelado fase 2 | `totp-schemas.ts`, `api-spec.yml` | Unit `totp-schemas`, freeze report |
| UI `/perfil/seguridad` noindex + self-service | `page.tsx` metadata `robots`, `getPortalSession` | E2E smoke redirección |
| Non-goals: rate limit GTK-26, UI login GTK-69 | Documentado; E2E completo sustituido por QA | Step 8 informe |

Desviaciones conscientes y aceptadas: flujo E2E de login con TOTP en UI pendiente de GTK-69; rate limit TOTP en GTK-26; `sessionTokenHash` en sesión Auth.js preexistente (no introducido por GTK-24).

## Checklist arquitectura

- [x] Lógica de negocio en `/lib` (`totp-core`, `crypto`, `totp-actions`, `totp-verifier`); página delgada.
- [x] Inputs externos validados con schemas Zod del contrato (`totp-schemas`, `login-schemas`).
- [x] Server Actions con authz servidor (`getPortalSession` / `InvalidSessionError` → `UNAUTHORIZED`).
- [x] Must-audit en activación/desactivación con `{ tx }` (SEC-7).
- [x] Frontend: Server Component + Client form; sin lógica de cifrado en cliente.
- [x] Tests conductuales SEC-N y funcionales; `npm test` 110/110 PASS (2026-07-24).

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| Menor | Frontend | Tarea 4.3 (revisión accesibilidad/copy) no cerrada en `tasks.md` aunque hay `label` + `role="alert"` | `totp-setup-form.tsx` | Cerrar 4.3 en fase 7 o marcar checkbox tras pasada UX |
| Menor | Docs | `9.3b` (cierre formal `data-model.md`) pendiente en tasks | `tasks.md` | Confirmar en fase 7 que api-spec ya refleja acciones |
| Menor | Crypto | Semgrep `gcm-no-tag-length` en `createDecipheriv` | `security.md` §SAST | Opcional: `authTagLength: 16` en opciones Node |
| Menor | Ops | `.env` local incompleto respecto a `lib/env.ts` (patrón GTK-23) | Harness previo | Documentar vars para `npm run dev` |
| Menor | Auth | `totp-core.ts` sin `server-only` (solo importado desde servidor hoy) | `totp-core.ts` | Añadir `server-only` en hardening futuro si se reexporta |

Sin hallazgos **Bloqueante** ni **Mayor** pendientes.

## Sección de seguridad

- **Resultado scan (5b):** HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN — SCA transversal preexistente; SAST medio/bajo aceptados; secretos LIMPIO; DAST omitido con sustituto QA HTTP.
- **Hallazgos aceptados validados:**
  - GCM tag length: mitigación verificable (slice 16 bytes + `setAuthTag`).
  - HTTP en `tests/qa`: solo localhost CI/manual.
  - SCA `next-auth`/`next`: misma línea que changes anteriores del stack.
- **Checklist OWASP (GTK-24):**
  - A01: acciones limitadas al `userId` de sesión — OK.
  - A02: secreto cifrado; clave en env; argon2 en disable — OK.
  - A03: Prisma parametrizado; sin HTML inseguro en flujo 2FA — OK.
  - A04: SEC-1…SEC-7 cubiertos en tests unitarios/QA — OK.
  - A05: `server-only` en crypto/verifier; admin noindex — OK.
  - A07: 2FA operativo; rate limit explícitamente fuera de alcance (GTK-26) — aceptado en design.
  - A08: `otplib`/`qrcode` sin advisories nuevos — OK.
  - A09: audit `2fa_enabled`/`2fa_disabled` con whitelist `event`; sin secreto en metadata — OK.

## SEC-N (threat model)

| ID | Estado |
|----|--------|
| SEC-1 | Cubierto (`authenticate-credentials.test.ts`, QA HTTP) |
| SEC-2 | Cubierto (`totp-actions` SEC-2, sanitize) |
| SEC-3 | Cubierto (confirm inválido / sin activar flag) |
| SEC-4 | Cubierto (`disable` password + TOTP) |
| SEC-5 | Cubierto (`sanitize.test.ts`, QA audit) |
| SEC-6 | Cubierto (acciones sin sesión) |
| SEC-7 | Cubierto (mock fallo `recordAudit` en unit) |

Veredicto: APTO
