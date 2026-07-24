# Tasks — gtk-24-segundo-factor-totp

> US: [GTK-24](https://linear.app/geoteknia/issue/GTK-24/segundo-factor-de-autenticacion-totp-del-portal) — Segundo factor de autenticación (TOTP) del portal
> Rama: `feature/backend-gtk-24-segundo-factor-totp`
> Nota: parte de la implementación (fase 4) puede estar adelantada en la rama; las fases 2–3 y 5–8 deben cerrarse según harness antes de archive.

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-24-segundo-factor-totp` desde `main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-24-segundo-factor-totp` con proposal/design/specs/tasks (fase 1 SDD).
- [x] 0.4 **Gate 1 humano:** aprobar proposal + specs + design (+ threat model) antes de congelar contrato.

## 1. Contrato (fase 2 — tras Gate 1)

- [x] 1.1 Documentar contrato Zod de `totp-actions` (`confirm` / `disable`) y reexport `totpCodeSchema` en `api-spec.yml` o sección Server Actions del portal (sin Route Handler nuevo).
- [x] 1.2 Actualizar `docs/technical/api-spec.yml` (campo `totp` en login ya documentado; añadir acciones de gestión 2FA si aplica).
- [x] 1.3 Congelar contrato (artefactos en disco listos para TDD).

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests `totp-core`: secreto/URI, ventana ±1, rechazo fuera de ventana.
- [x] 2.2 Tests `crypto`: round-trip, GCM auth tag, clave incorrecta.
- [x] 2.3 Tests `totp-verifier`: verificación con secreto cifrado mock; sin secreto activo.
- [x] 2.4 Tests `totp-actions`: activación OK/fallo, desactivación reauth OK/fallo; abuse SEC-3/SEC-4/SEC-6.
- [x] 2.5 Tests `authenticate-credentials` con verificador registrado (TOTP OK/ausente/inválido) — SEC-1.
- [x] 2.6 Tests `sanitize` metadata `event` en `role_change` — SEC-5.
- [x] 2.7 Ejecutar Vitest y adjuntar evidencia RED o registro de tests añadidos post-impl en `reports/YYYY-MM-DD-step-2-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1 Añadir `TWOFA_ENCRYPTION_KEY` a `lib/env.ts` y `.env.example`.
- [x] 3.2 Crear `lib/auth/crypto.ts` (AES-256-GCM, `server-only`).
- [x] 3.3 Crear `lib/auth/totp-core.ts` (`generateTotpSecret`, `verifyTotpCode`, ventana ±1).
- [x] 3.4 Crear `lib/auth/totp-verifier.ts` + import for-side-effect en `lib/auth/config.ts` (no tocar lógica `authorize`).
- [x] 3.5 Crear `lib/auth/totp-actions.ts` (generate / confirm / disable + audit `{ tx }`).
- [x] 3.6 Ampliar `METADATA_WHITELIST.role_change` con `event` en `lib/audit/sanitize.ts`.
- [x] 3.7 Exportar `totpCodeSchema` desde `login-schemas.ts`.
- [x] 3.8 Verificar que tests de fase 2 están en VERDE y alineados con specs.

## 4. Implementación frontend (fase 4b)

- [x] 4.1 Crear `app/(admin)/perfil/seguridad/page.tsx` (Server Component, `noindex`, sesión).
- [x] 4.2 Crear `totp-setup-form.tsx` (Client: QR, confirmación, desactivación).
- [x] 4.3 Revisar accesibilidad mínima (labels, `role="alert"`) y copy en español.

## 5. Revisar tests existentes (OBLIGATORIO)

- [x] 5.1 Actualizar `tests/unit/env.test.ts` con `TWOFA_ENCRYPTION_KEY`.
- [x] 5.2 Actualizar `authenticate-credentials.test.ts` y `sanitize.test.ts`.
- [x] 5.3 Revisar suite completa tras cambios de contrato (fase 2).

## 6. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Capturar línea base de conteos `users` / `audit_logs` para usuario de prueba.
- [x] 6.2 Ejecutar `npm test` y registrar salida.
- [x] 6.3 Probar activación/desactivación 2FA en BD (sin filtrar `twofa_secret` en informes); restaurar estado.
- [x] 6.4 Crear informe `reports/YYYY-MM-DD-step-6-unit-test-and-db-verification.md`.

## 7. Prueba manual Server Actions / login (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 7.1 Arrancar Next.js con `TWOFA_ENCRYPTION_KEY` válida.
- [x] 7.2 Flujo enrolamiento: generate → confirm → comprobar `twofa_enabled` y audit `2fa_enabled` (metadata con `event`).
- [x] 7.3 Login con credenciales + TOTP; fallo con código incorrecto.
- [x] 7.4 Desactivación con password + TOTP; audit `2fa_disabled`.
- [x] 7.5 Confirmar que respuestas y logs no contienen secreto en claro.
- [x] 7.6 Crear informe `reports/YYYY-MM-DD-step-7-server-action-verification.md`.

## 8. E2E Playwright (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 8.1 E2E: activar 2FA desde `/perfil/seguridad`, logout, login exigiendo TOTP. _(Bloqueado GTK-69; sustituto QA integración/HTTP)_
- [x] 8.2 E2E: login fallido con TOTP incorrecto; desactivación con reautenticación. _(Bloqueado GTK-69; cubierto en QA Vitest)_
- [x] 8.3 Crear informe `reports/YYYY-MM-DD-step-8-playwright-e2e-verification.md`.

## 9. Security scan + code review + docs

- [x] 9.1 Security scan (SAST/SCA/secrets/DAST ligero si aplica) → `reports/security.md`.
- [x] 9.2 Code review gate → `reports/code-review.md` con `Veredicto: APTO`.
- [x] 9.3 Docs parcial: `backend-standards.md` §8.3 (verificador TOTP + `metadata.event`).
- [x] 9.3b Completar docs: `api-spec.yml` tras fase 2; revisar `data-model.md` (sin cambio de schema).

## 10. Archive (tras Gate 2 humano)

- [x] 10.1 Ejecutar `bash ai-specs/scripts/require-code-review.sh gtk-24-segundo-factor-totp`.
- [x] 10.2 `/opsx:verify` y `/opsx:archive`; comentar en Linear con ruta de archive.
