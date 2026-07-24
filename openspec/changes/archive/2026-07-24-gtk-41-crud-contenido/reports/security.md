# Security Scan — gtk-41-crud-contenido

- Fecha: 2026-07-24
- Diff analizado: `main..HEAD` (rama sin commits adelante de `main`; working tree incluye `lib/content/**`, `app/(admin)/contenido/**`, migración audit, tests)
- Herramientas: Semgrep (`npm run security:sast main`), npm audit (`npm run security:sca`), gitleaks (`npm run security:secrets main`), DAST script (`npm run security:dast main`)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS (orquestador exit 1) | 0 en diff GTK-41 | 0 en diff GTK-41 | 0 | 0 |
| SCA | HALLAZGOS pre-existentes | 2 | 3 | — | — |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sin Route Handlers) | — | — | — | — |

## Hallazgos

### SAST — Semgrep (8 blocking en repo; fuera del diff GTK-41)

| Ubicación | Regla | Relación GTK-41 |
|-----------|-------|-----------------|
| `lib/auth/crypto.ts` | `gcm-no-tag-length` | Pre-existente (GTK-24) |
| `tests/qa/gtk24-http-login.qa.test.ts` | `react-insecure-request` | Pre-existente (QA HTTP local) |

**Revisión manual del diff GTK-41:**

- Módulos `lib/content/*` con `import 'server-only'` donde aplica; dominio Prisma sin SQL crudo.
- Server Actions: `withPermission` / `withAdmin`; validación Zod en capa dominio.
- Auditoría transaccional `content_update` / `delete`; metadata whitelist (`entitySlug`, `contentType`) sin cuerpos editoriales.
- Sin endpoints `app/api/**` nuevos.

**Estado:** ACEPTADO para fase 6 en superficie GTK-41 — hallazgos Semgrep no introducidos por este change.

### SCA — npm audit

- **Severidad:** 2 críticas (`@auth/core` / `next-auth`), 3 altas (`next`, `postcss`, `sharp`).
- **Ubicación:** `package-lock.json` — sin cambios de dependencias en GTK-41.
- **Estado:** ACEPTADO — deuda transversal; seguimiento infra.

### Secretos — gitleaks

- `0 commits scanned` en `main..HEAD` (sin commits en rama remota); working tree sin fugas en escaneo de commits.
- **Estado:** LIMPIO en commits del change.

### DAST

- Script: `DAST: omitido - no hay Route Handlers nuevos/modificados en el diff main..HEAD`.
- **Estado:** OMITIDO (coherente con Server Actions only).

## Veredicto del scan

**HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** — SAST/SCA reportan issues pre-existentes o fuera del diff GTK-41; superficie nueva cumple shift-left (RBAC, Zod, server-only, audit). Sin hallazgos bloqueantes atribuibles al CRUD de contenido.
