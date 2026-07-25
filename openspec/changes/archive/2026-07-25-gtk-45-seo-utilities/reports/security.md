# Security scan — gtk-45-seo-utilities

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | 8 hallazgos **preexistentes** (`lib/auth/crypto.ts`, QA GTK-24). **Ninguno en `lib/seo/` ni `components/seo/`.** |
| SCA (`pnpm audit`) | FALLO | Deuda conocida `next-auth@5.0.0-beta.31` + cadena `@lhci/cli`/`tmp`. Sin nuevas dependencias en GTK-45. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos |

## Hallazgos del diff GTK-45

- **SEC-1:** Tests escape + E2E view-source (`\u003c` en payload `</script>`).
- **SEC-2:** Sin `dangerouslySetInnerHTML` en `<JsonLd>` (contenido en children de `<script>`).
- **SEC-3:** Página `/dev-seo` con `noindex`; test `dev-seo-metadata.test.ts`.

## Aceptación para gate 6

Fallos SAST/SCA heredados; el diff no introduce endpoints ni deps vulnerables nuevas.

## Severidad agregada

- **Crítico nuevo en GTK-45:** 0
- **Alto nuevo en GTK-45:** 0
