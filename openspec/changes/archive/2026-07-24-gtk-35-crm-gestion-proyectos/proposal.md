# Proposal — gtk-35-crm-gestion-proyectos

> US: [GTK-35 — CRM: gestión de proyectos (estados, asignación, hitos, notas, documentos)](https://linear.app/geoteknia/issue/GTK-35/crm-gestion-de-proyectos-estados-asignacion-hitos-notas-documentos)
> Labels: `Backend`, `Admin`, `Feature` | Dependencias: GTK-25 (RBAC, ✅), GTK-22 (audit, ✅), GTK-34 (lectura CRM, ✅) | Desbloquea: UI de mutación en admin, métrica `first_response_at` en GTK-34, E2E integrado (US frontend futura)

## Why

GTK-34 entregó la **lectura** del pipeline en `/admin`; falta la **escritura** para operar el CRM de extremo a extremo: transiciones de estado con historial append-only, asignación de técnico, registro idempotente de primera respuesta (`first_response_at`), hitos, notas internas y documentos. Sin esto el gestor no puede avanzar leads en el pipeline ni medir el SLA <48 h. Materializa RF-18 y US-15; completa el write-path que GTK-34 dejó pendiente para la métrica de tiempo medio.

## What Changes

- **Migración Prisma:** ampliar enum `AuditAction` con `state_change` y `assign` (no existe `update` genérico).
- **Auditoría:** `lib/audit/actions.ts`, `lib/audit/sanitize.ts` — nuevas acciones `mustAudit` y whitelist de metadata.
- **RBAC:** conceder a `tecnico` `projects.update` (sin `assign` ni `delete`) — ver `design.md` Hallazgo 2.
- **Dominio:** `lib/projects/transitions.ts`, `assign.ts`, `milestones.ts`, `notes.ts`, `documents.ts` + schemas Zod por acción.
- **Server Actions:** `app/(admin)/admin/proyectos/[id]/actions.ts` con `withPermission` + `assertOwnership` + transacciones Prisma + `recordAudit({ tx })`.
- **Tests:** Vitest con verificación de BD (transiciones, idempotencia, RBAC, auditoría, soft delete).
- **Sin** Route Handlers nuevos — mutaciones vía Server Actions (contrato Zod compartido, sin cambio OpenAPI salvo documentación de acciones si aplica).
- **QA:** unit + BD; **sin curl N+2** (no hay Route Handlers); **sin E2E N+3** (label `Backend`).

## Capabilities

### New Capabilities

- (ninguna capability nueva en `openspec/specs/` — se extiende la existente)

### Modified Capabilities

- `admin-crm-projects-pipeline`: añadir requisitos de mutación CRM (estado, asignación, hitos, notas, documentos) con RBAC, auditoría y consistencia transaccional.

## Impact

- **Código:** `lib/projects/*` (nuevos módulos de escritura), `lib/audit/*`, posiblemente `lib/auth/permissions.ts` + `prisma/seed.ts`, `app/(admin)/admin/proyectos/[id]/actions.ts`, tests en `tests/unit/projects/**`.
- **BD:** migración enum `AuditAction`; escritura en `projects`, `project_state_history`, `project_milestones`, `project_notes`, `project_documents`, `audit_logs`.
- **API:** sin Route Handlers; `api-spec.yml` puede documentar Server Actions internas en fase 2 si el estándar lo exige para admin.
- **RGPD/PII:** notas y documentos pueden contener datos de cliente; solo portal autenticado; soft delete; sin PII en logs ni metadata de auditoría.
- **GTK-34:** pobla `first_response_at` → métrica de tiempo medio deja de ser `null` cuando haya actividad.

## Fuera de alcance

- UI de formularios/botones en detalle de proyecto (ticket frontend futuro; este change expone Server Actions).
- Subida de ficheros a `media_assets` (solo enlace por `mediaAssetId` o `fileUrl`).
- Grafo de transiciones estricto por `order` (solo reglas mínimas: terminal, mismo estado, terminal solo desde no-terminal).
- E2E Playwright en este ticket (label `Backend`).
- Creación de proyectos desde leads (`projects.create`) — otro ticket.
