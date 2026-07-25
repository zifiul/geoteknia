# Security scan — gtk-43-bootstrap-frontal

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | 8 hallazgos **preexistentes** en `lib/auth/crypto.ts` y `tests/qa/gtk24-http-login.qa.test.ts` (HTTP local QA). **Ninguno en ficheros nuevos de GTK-43.** |
| SCA (`pnpm audit`) | FALLO | Deuda conocida `next-auth@5.0.0-beta.31`; nuevas devDeps `@lhci/cli` añaden `tmp` (solo CI Lighthouse, no runtime). `postcss` transitivo — revisar en ticket de deps. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos |

## Hallazgos del diff GTK-43

- **Ningún hallazgo SAST nuevo** atribuible a `app/(public)`, `app/globals.css`, `lib/seo/site-url.ts` o layouts.
- **SEC-1/SEC-2/SEC-3** cubiertos por tests unitarios del change.

## Aceptación para gate 6

Los fallos de SAST/SCA son **heredados o de tooling dev** y quedan documentados; no bloquean el alcance de andamiaje frontal. Actualización de `next-auth` estable y endurecimiento GCM siguen en tickets de seguridad/auth.

## Severidad agregada

- **Crítico nuevo en GTK-43:** 0
- **Alto nuevo en GTK-43:** 0
