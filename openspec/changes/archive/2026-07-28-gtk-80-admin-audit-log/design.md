# Design — GTK-80

## Decisiones

### Ruta y detalle

- Página única `app/(admin)/(portal)/admin/auditoria/page.tsx` (RSC).
- Detalle vía query `?event=<auditLogId>` y drawer cliente (`AuditEventDrawer`), alineado a Stitch screen `4c289d55814c4daf96c966855c40ce95` (no ruta `[id]` separada).

### Consultas

- `listAuditLogs`: select sin `metadata`; join `user.fullName`; `requirePermission('audit.read')`.
- `getAuditLogById`: incluye `metadata`, IP completa, user agent.
- Índices existentes en `audit_logs`; sin nuevas migraciones.

### IP en listado

- Columna con IP enmascarada (`maskAuditIpForList`) — nota Stitch A2.

### Deep-links

- `resolveAuditEntityHref(entityType, entityId)`: `projects` → `/admin/proyectos/{id}`; tipos en `EDITORIAL_CONTENT_TYPES` → `null` (GTK-73 pendiente).

### Permiso

- Añadir `audit.read` a `PERMISSIONS` y módulo `'audit'` en el tipo; sin cambios en `ROLE_PERMISSION_RULES` (solo admin vía `*`).

## UI (Stitch A2)

| Pantalla | Screen ID |
|----------|-----------|
| Listado + filtros | `9ea1c493b0c54f649661ea51034217e8` |
| Detalle drawer | `4c289d55814c4daf96c966855c40ce95` |

Tokens y atmósfera: `docs/design/DESIGN.md` y patrones de `admin/usuarios`.

## Threat model

### Superficie

- RSC `/admin/auditoria` y funciones `lib/admin/audit-queries.ts`.
- Drawer cliente (solo datos ya autorizados en servidor).

### Actores

- Admin con `audit.read`.
- Usuario autenticado de rol inferior forzando URL o llamando queries.

### Datos sensibles

- `audit_logs.metadata` (ya sanitizada en escritura GTK-22); IP/UA en detalle.

### Amenazas

| # | Amenaza | Vector | Mitigación |
|---|---------|--------|------------|
| T1 | Lectura sin permiso | URL / import directo | `requirePermission('audit.read')` |
| T2 | IDOR en detalle | UUID ajeno | Misma gate; 404 si no existe |
| T3 | UUID/fechas malformadas | Query string | Zod safeParse → feedback, no 500 |
| T4 | Fuga por listado | metadata en tabla | Excluir `metadata` del listado |
| T5 | XSS en JSON metadata | Render cliente | `JSON.stringify` en `<pre>`, sin HTML crudo |

### Requisitos de seguridad

- [ ] SEC-1: Sin `audit.read` → ForbiddenError antes de Prisma.
- [ ] SEC-2: Consultas de lectura no invocan `recordAudit`.
- [ ] SEC-3: Inputs de filtro validados con Zod.
