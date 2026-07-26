# Security Scan — gtk-56-equipo-tecnico

- Fecha: 2026-07-26
- Diff analizado: `main..HEAD` (ficheros GTK-56)
- Herramientas: Semgrep (fallback repo scope), `npm audit`, gitleaks, DAST omitido

## Resumen

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| SAST | LIMPIO (diff GTK-56) | Sin `dangerouslySetInnerHTML`, SQL crudo ni secretos en rutas/componentes nuevos |
| SCA | ACEPTADO (preexistente) | Advisories en `next-auth`/`@auth/core`/transitivas — no introducidas por este change |
| Secretos | LIMPIO | gitleaks sin leaks en commits del branch |
| DAST | OMITIDO | Sin Route Handlers nuevos |

## Hallazgos del change

Ninguno. Lectores server-only con `PUBLISHED_EDITORIAL_WHERE`; salida CMS escapada por React.

## Ruido Semgrep global (fuera de diff)

Hallazgos en `lib/auth/crypto.ts` y `tests/qa/gtk24-http-login.qa.test.ts` — preexistentes.

## Veredicto scan

**LIMPIO para merge de GTK-56** (SCA heredado documentado, sin DAST).
