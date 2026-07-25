# Security scan — gtk-47-layout-publico

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | Hallazgos **preexistentes** en el repo; ninguno atribuible a `lib/content/organization.ts` ni `components/organisms/layout/`. |
| SCA (`pnpm audit`) | FALLO | Deuda conocida (`next-auth` beta, `@lhci/cli`). **Sin dependencias nuevas** en GTK-47. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos |

## Diff GTK-47

- Lectura server-only con DTO NAP mínimo; sin PII de leads en layout.
- Enlaces de contacto con tracking condicionado a consent (GTK-46).
- Navegación con rutas estáticas (sin open redirect).

## Aceptación gate 6

Fallos SAST/SCA heredados; el diff no amplía superficie HTTP ni añade paquetes.
