# Security scan — gtk-78-canonical-pagination-noindex

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | 8 hallazgos **preexistentes** (`lib/auth/crypto.ts`, QA GTK-24). **Ninguno en archivos nuevos GTK-78** (`lib/seo/canonical.ts`, `robots-rules.ts`, `pagination-links.tsx`, `canonical-lab`). |
| SCA (`pnpm audit`) | FALLO | Deuda conocida `next-auth@5.0.0-beta.31` + cadena `@lhci/cli`/`tmp`. Sin nuevas dependencias. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos |

## Hallazgos del diff GTK-78

- **SEC-1:** `normalizeListingBasePath` rechaza paths con esquema HTTP(S); tests unitarios.
- **SEC-2:** Laboratorio `canonical-lab` con `noindex` por defecto (sin filtros); filtros → `resolveListingRobots` noindex.
- **SEC-3:** Sin `dangerouslySetInnerHTML` en componentes nuevos.

## Aceptación para gate 6

Fallos SAST/SCA heredados; el diff no introduce endpoints ni dependencias vulnerables nuevas.

## Severidad agregada

- **Crítico nuevo en GTK-78:** 0
- **Alto nuevo en GTK-78:** 0
