# Security Scan — gtk-24-segundo-factor-totp

- Fecha: 2026-07-24
- Diff analizado: `main` + working tree (**28** ficheros `.ts/.tsx`; sin commits en `main..HEAD` aún)
- Herramientas: Semgrep (80 rules, `p/typescript` + `p/react` + `p/owasp-top-ten`), `npm audit`, gitleaks (`.gitleaks.toml`), DAST script + sustituto QA HTTP (fase 5a)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS ACEPTADOS | 0 | 0 | 1 | 7 |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sustituto QA) | 0 | 0 | 0 | 0 |

## SAST

- Comando orquestador: `npm run security:scan` (exit 1 por Semgrep + audit).
- Alcance efectivo del change: Semgrep sobre los 28 ficheros del diff local (lista en §Anexo).
- **0** hallazgos en patrones prohibidos del proyecto (`$queryRawUnsafe`, `dangerouslySetInnerHTML`, `eval`, secretos hardcodeados en código de producción).
- Módulos sensibles: `lib/auth/crypto.ts`, `totp-verifier.ts` con `server-only`; acciones en `totp-actions.ts` (`use server`) con sesión (`getPortalSession`) y Zod.

### [SEV-MEDIA] Semgrep `gcm-no-tag-length` en descifrado GCM

- Ubicación: `lib/auth/crypto.ts:41`
- Descripción: regla genérica de Semgrep sobre `createDecipheriv` sin `authTagLength` en opciones.
- Evidencia: el payload exige longitud mínima, extrae **16 bytes** fijos de tag (`AUTH_TAG_LENGTH`) y llama `decipher.setAuthTag(authTag)` antes de `final()`.
- Recomendación: opcional en fase posterior añadir `{ authTagLength: AUTH_TAG_LENGTH }` en `createDecipheriv` para silenciar la regla sin cambiar comportamiento.
- Estado: **ACEPTADO** — mitigación explícita de longitud de tag en aplicación; no hay vector de tag truncado con el formato actual.

### [SEV-BAJA] Semgrep `react-insecure-request` (HTTP en tests QA)

- Ubicación: `tests/qa/gtk24-http-login.qa.test.ts` (7 ocurrencias)
- Descripción: `fetch` a `http://127.0.0.1:3011` en pruebas de integración contra `next start` local.
- Recomendación: mantener solo en `tests/qa/`; no aplica a tráfico de producción (HTTPS).
- Estado: **ACEPTADO** — patrón alineado con GTK-23 (`tests/qa` + servidor local).

## SCA

- Comando: `npm run security:sca`
- `npm audit`: **5** vulnerabilidades (**2** critical en `@auth/core` / `next-auth`, **3** high en `next`, `postcss`, `sharp`).
- **Dependencias nuevas del change:** `otplib@13.4.1`, `qrcode@1.5.4` — sin advisories reportados en el árbol auditado.
- Estado: **ACEPTADO** — deuda transversal del stack (mismo criterio que GTK-23/GTK-27); upgrade fuera de alcance de GTK-24.

## Secretos

- Comando: `npm run security:secrets` → gitleaks `main..HEAD`: **0 commits**, 0 leaks.
- Fallback manual en ficheros del diff: sin claves reales; solo placeholders de test (`sk-ant-qa-fake`, etc.) en env de Vitest.
- `.env` no versionado; `.env.example` solo documenta `TWOFA_ENCRYPTION_KEY` (hex de ejemplo).
- Estado: **LIMPIO**

## DAST

- Script: `npm run security:dast` → **omitido** (ningún `app/api/**/route.ts` nuevo o modificado en el diff).
- Sustituto (fase 5a): `tests/qa/gtk24-http-login.qa.test.ts` — CSRF, login con/sin TOTP, sin respuestas 5xx en escenarios probados; informe step 7.
- Estado: **OMITIDO con cobertura sustituta documentada** (no se declara LIMPIO por DAST automático).

## Revisión manual shift-left (diff GTK-24)

| Tema | Estado |
|------|--------|
| Server Actions validadas con Zod (`totp-schemas`) | OK |
| Enrolamiento/desactivación exigen sesión + password (+ TOTP al desactivar) | OK |
| Secreto TOTP cifrado en reposo (`encryptSecret` / `TWOFA_ENCRYPTION_KEY`) | OK |
| Audit `2fa_enabled` / `2fa_disabled` con `metadata.event` en whitelist sanitize | OK |
| Login TOTP vía verificador registrado (`totp-verifier`), sin tocar `authorize()` directamente | OK |
| Exposición `sessionTokenHash` en `/api/auth/session` | **Preexistente** (GTK-23); fuera de alcance GTK-24 |

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — sin bloqueantes de seguridad introducidos por GTK-24; SCA y hallazgos Semgrep documentados y aceptados para gate de fase 6.

## Anexo — ficheros escaneados (diff local)

`app/(admin)/perfil/seguridad/*`, `lib/auth/crypto.ts`, `totp-*.ts`, `lib/audit/sanitize.ts`, `lib/auth/config.ts`, `lib/env.ts`, tests unit/qa/e2e GTK-24, scripts `gtk24-*`, `vitest.config.ts`, `playwright.gtk24.config.ts`.
