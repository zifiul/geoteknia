# Security Scan — gtk-26-aislamiento-admin-rate-limiting

- Fecha: 2026-07-24
- Diff analizado: working tree vs `main` (**sin commits** en `main..HEAD`; ficheros GTK-26 listados en anexo)
- Herramientas: `npm run security:scan`, revisión manual del diff GTK-26, curl DAST sustituto (fase 5a step 7)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS ACEPTADOS (preexistentes) | 0 | 0 | 1 | 7 |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sustituto curl middleware) | 0 | 0 | 0 | 0 |

## SAST

- Comando: `npm run security:scan` → Semgrep exit **1** (8 findings en árbol ampliado `app/`, `lib/`, `tests/` al no haber diff commiteado).
- **Ficheros GTK-26** (`middleware.ts`, `lib/security/*`, `lib/auth/auth-edge.ts`, `app/robots.ts`): **0** hallazgos Semgrep en revisión manual (sin `$queryRawUnsafe`, `eval`, `dangerouslySetInnerHTML`, secretos hardcodeados).
- `auth-edge.ts` deliberadamente **sin** `server-only` (Edge); no importa Prisma ni `lib/env.ts`.

### Hallazgos fuera del alcance GTK-26 (mismo criterio GTK-24)

- `lib/auth/crypto.ts` — regla `gcm-no-tag-length`: **ACEPTADO** (tag 16 bytes + `setAuthTag`).
- `tests/qa/gtk24-http-login.qa.test.ts` — `react-insecure-request` HTTP local: **ACEPTADO** (solo QA).

## SCA

- Comando: `npm run security:sca` → **5** vulnerabilidades (`@auth/core`, `next`, `postcss`, `sharp`).
- **Sin dependencias npm nuevas** en GTK-26.
- Estado: **ACEPTADO** — deuda transversal del stack; fuera de alcance de este ticket.

## Secretos

- Comando: `npm run security:secrets` → gitleaks `main..HEAD`: 0 commits, **0 leaks**.
- `.env.example` solo documenta placeholders de rate limit / Upstash comentados.
- Estado: **LIMPIO**

## DAST

- Script: `npm run security:dast` → **omitido** (ningún `app/api/**/route.ts` en diff commiteado).
- Sustituto: curl a `/admin`, `/api/admin/health`, POST malicioso sin sesión → **401**, sin 5xx (informe step 7).
- Estado: **OMITIDO con cobertura sustituta documentada**

## Revisión manual shift-left (diff GTK-26)

| Tema | Estado |
|------|--------|
| Middleware sin consulta BD / sin PII en JSON de error | OK |
| Log 401: `ipHint` truncado + path (sin email) | OK |
| Rate limit in-memory documentado; sin store en cliente | OK |
| Cabeceras `X-Robots-Tag` + `nosniff` en redirect y 401 | OK |
| JWT Edge vs revocación Node (`auth-edge` vs `config.ts`) | OK (diseño doble capa) |

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — sin bloqueantes introducidos por GTK-26; SCA y Semgrep preexistentes documentados para gate fase 6.

## Anexo — ficheros del change (working tree)

`middleware.ts`, `app/robots.ts`, `lib/auth/auth-edge.ts`, `lib/security/rate-limit.ts`, `lib/security/rate-limit-env.ts`, `lib/security/headers.ts`, `lib/env.ts`, `.env.example`, `tests/unit/security/*`, `tests/unit/env.test.ts`, artefactos OpenSpec GTK-26.
