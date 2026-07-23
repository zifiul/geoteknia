# Proposal — gtk-22-audit-log-service

> US: [GTK-22 — Servicio de audit log de acciones sensibles](https://linear.app/geoteknia/issue/GTK-22/servicio-de-audit-log-de-acciones-sensibles)
> Dependencias: GTK-7 (modelo `audit_logs`) | Desbloquea: GTK-23, GTK-25, GTK-34/35, GTK-38/39/40

## Why

El portal interno exige trazabilidad append-only de acciones sensibles (publicar, aprobar, eliminar, login, cambios de rol, IA, exportaciones) para rendición de cuentas y evidencia RGPD. GTK-7 creó la tabla; esta US materializa el servicio `recordAudit` consumible por handlers y casos de uso.

## What Changes

- Crear `lib/audit/actions.ts` con constantes alineadas al enum Prisma `AuditAction` y política `mustAudit`.
- Crear `lib/audit/sanitize.ts` con lista blanca de metadata por acción y redacción de PII/secretos.
- Crear `lib/audit/request-context.ts` con helper para extraer IP y user-agent de headers HTTP.
- Crear `lib/audit/log.ts` con `recordAudit(input, options?)` validado por Zod y persistencia append-only.
- Tests unitarios Vitest: persistencia, rechazo de acción inválida, sanitización de metadata.

## Capabilities

### New Capabilities

- `audit-log-service`: servicio interno append-only para registrar acciones sensibles del portal.

### Modified Capabilities

Ninguna (el modelo `AuditLog` ya está en `rbac-identity-audit`).

## Impact

- **Código:** `lib/audit/**`, tests en `tests/unit/audit/**`.
- **BD:** ningún cambio de schema (reutiliza GTK-7).
- **API / UI:** ninguno (servicio interno; fase contrato omitida).
- **RGPD:** metadata sanitizada; sin PII completa ni secretos en logs.
- **Tickets desbloqueados:** GTK-23 (login audit), GTK-25 (RBAC), flujos editoriales y CRM.

## Fuera de alcance

- Endpoint de consulta de audit log (ticket posterior).
- Integración en handlers concretos (GTK-23+).
- E2E de publicación con audit (requiere flujo editorial implementado).
