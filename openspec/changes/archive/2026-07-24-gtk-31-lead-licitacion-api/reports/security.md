# Security Scan — gtk-31-lead-licitacion-api

- Fecha: 2026-07-24
- Diff analizado: `main..HEAD` (working tree sin commit; Semgrep escaneó `app/`, `lib/`, `tests/`)
- Herramientas: Semgrep (SAST), `npm audit` (SCA), gitleaks (secretos), DAST script (omitido sin commits en diff)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS PREEXISTENTES | 0 | 0 | 0 | 8* |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | NO AUTOMÁTICO** | — | — | — | — |

\* Bloqueos Semgrep en `lib/auth/crypto.ts` y `tests/qa/gtk24-http-login.qa.test.ts`; no introducidos por GTK-31.

\** `security:dast` omitió por diff vacío `main..HEAD`; validación de abuso vía tests unitarios del handler + QA BD.

## Hallazgos atribuibles al change

Ninguno. Código nuevo: validación Zod strict, Turnstile server-side, rate limit, transacción Prisma, sin PII en logs del route, `server-only` en caso de uso.

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — Sin hallazgos de seguridad introducidos por el endpoint de licitación; SCA/SAST baseline del repo.
