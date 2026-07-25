# Security scan — gtk-44-design-system

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | 8 hallazgos **preexistentes** (`lib/auth/crypto.ts`, QA GTK-24). **Ninguno en `components/` ni `dev-componentes`.** |
| SCA (`pnpm audit`) | FALLO | Deuda conocida `next-auth@5.0.0-beta.31` + cadena `@lhci/cli`/`tmp`. Nuevas deps Radix sin CVE críticas atribuibles al diff en revisión manual. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos |

## Hallazgos del diff GTK-44

- **SEC-2:** Sin `dangerouslySetInnerHTML` en componentes base (revisión de código).
- **SEC-3:** `@radix-ui/react-dialog`, `react-accordion`, `react-tabs` versionadas en `package.json`.
- **SEC-1:** Test unitario `dev-componentes-metadata.test.ts`.

## Aceptación para gate 6

Fallos SAST/SCA heredados o de tooling dev; no introducen superficie HTTP nueva. Radix aporta primitivos sin estilos (Opción A documentada en `design.md`).

## Severidad agregada

- **Crítico nuevo en GTK-44:** 0
- **Alto nuevo en GTK-44:** 0
