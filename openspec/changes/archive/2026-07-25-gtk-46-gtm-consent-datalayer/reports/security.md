# Security scan — gtk-46-gtm-consent-datalayer

- **Fecha:** 2026-07-25
- **Base diff:** `main..HEAD`
- **Comando:** `pnpm run security:scan`

## Resumen

| Chequeo | Estado | Notas |
|---------|--------|-------|
| SAST (Semgrep) | FALLO | 8 hallazgos **preexistentes** (`lib/auth/crypto.ts`, QA GTK-24). **Ninguno en `lib/analytics/consent*`, `datalayer`, `track`, `components/analytics/`.** |
| SCA (`pnpm audit`) | FALLO | Deuda conocida `next-auth@5.0.0-beta.31` + `@lhci/cli`/`tmp`. **Sin nuevas dependencias** en GTK-46. |
| Secretos (gitleaks) | OK | |
| DAST | OK (omitido) | Sin Route Handlers nuevos en diff |

## Hallazgos del diff GTK-46

- **SEC-1–5:** Cubiertos en diseño + tests (consentimiento, schema strict, `sanitizePageUrl`, E2E red GTM).
- GTM container **no** se carga hasta opt-in analítica/marketing (reduce superficie pre-consentimiento).
- Sin PII en dataLayer; atribución utm/gclid acotada.

## Aceptación para gate 6

Fallos SAST/SCA heredados del repo; el diff GTK-46 no introduce endpoints ni dependencias vulnerables nuevas.

## Severidad agregada

- **Crítico nuevo en GTK-46:** 0
- **Alto nuevo en GTK-46:** 0
