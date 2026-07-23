# Tasks — gtk-22-audit-log-service

> US: GTK-22 — Servicio de audit log de acciones sensibles
> Fases omitidas: contrato API (2 — servicio interno), frontend (4b), E2E (sin flujo editorial).

## 0. Setup

- [x] 0.1 Revisar Linear GTK-22 y modelo `AuditLog` (GTK-7).
- [x] 0.2 Crear rama `feature/gtk-22-audit-log-service`.

## 1. Servicio lib/audit

- [x] 1.1 Crear `lib/audit/actions.ts` (enum, mustAudit).
- [x] 1.2 Crear `lib/audit/sanitize.ts` (whitelist + redacción).
- [x] 1.3 Crear `lib/audit/request-context.ts` (IP, user-agent).
- [x] 1.4 Crear `lib/audit/log.ts` con `recordAudit`.
- [x] 1.5 Crear `lib/audit/index.ts` (barrel export).

## 2. Tests (TDD / Vitest)

- [x] 2.1 Tests: persistencia correcta, userId null, acción inválida.
- [x] 2.2 Tests: sanitización elimina claves sensibles.
- [x] 2.3 Tests: mustAudit propaga error; best-effort retorna null.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck`, `npm run lint`.
- [x] 3.2 Crear informe `reports/2026-07-23-step-3-unit-test-and-db-verification.md`.
