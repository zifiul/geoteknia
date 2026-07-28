# GTK-80 — Pantalla de consulta del audit log (admin)

**Linear:** [GTK-80](https://linear.app/geoteknia/issue/GTK-80)

## Why

El administrador debe investigar incidentes y cumplir trazabilidad (RF-17) sin acceso directo a la base de datos, sobre el servicio de escritura de [GTK-22](https://linear.app/geoteknia/issue/GTK-22).

## What

- Permiso atómico `audit.read` (módulo `audit`) solo para Administrador vía `admin: ['*']`.
- Ruta `/admin/auditoria`: listado paginado, filtros en URL, detalle en **drawer** (Stitch A2).
- `listAuditLogs` / `getAuditLogById` en `lib/admin/audit-queries.ts`.
- Nav `Auditoría` en `ADMIN_NAV_SECTIONS`.
- UI Stitch Oleada A2 (comentario Linear 2026-07-20): listado `9ea1c493…`, drawer `4c289d558…`.

## Impact

- `lib/auth/permissions.ts`, `lib/admin/**`, `app/(admin)/(portal)/admin/auditoria/**`, `components/organisms/admin/audit/**`.
- Sin Route Handlers nuevos; contrato = schemas Zod de filtros.
- Deep-link a `/admin/proyectos/[id]` para `entityType=projects`; enlaces a contenido editorial omitidos hasta GTK-73.
