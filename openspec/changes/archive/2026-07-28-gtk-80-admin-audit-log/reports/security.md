# Security Scan — gtk-80-admin-audit-log

- Fecha: 2026-07-28
- Diff analizado: `main..HEAD`
- Herramientas: security:scan (Semgrep, npm audit, gitleaks, DAST omitido)

## Resumen

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| SAST | FALLO (exit 1) — 8 hallazgos | Semgrep en `lib/auth/crypto.ts` y `tests/qa/gtk24-http-login.qa.test.ts`; **ninguno** en archivos GTK-80 (`audit-*`, `admin/auditoria`) |
| SCA | Hallazgos preexistentes en toolchain | Sin deps nuevas en GTK-80 |
| Secretos | LIMPIO | gitleaks 0 leaks |
| DAST | omitido | Sin endpoints HTTP nuevos |

## Hallazgos en código GTK-80

Ninguno crítico/alto en archivos del change: validación Zod de filtros, `requirePermission('audit.read')`, metadata solo en detalle, JSON en `<pre>` sin HTML.

## Veredicto scan

**Aceptable para merge** con SCA global del monorepo fuera de alcance del ticket (mismas advisories que en main).
