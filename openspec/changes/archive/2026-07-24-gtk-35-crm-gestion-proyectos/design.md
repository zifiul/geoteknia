# Design — gtk-35-crm-gestion-proyectos

> Escritura CRM en `/admin`: casos de uso en `lib/projects/`, Server Actions en `app/(admin)/admin/proyectos/[id]/actions.ts`, auditoría transaccional y migración de enum.

## Decisiones de negocio (bloqueantes — Gate 1)

| # | Tema | Decisión propuesta | Alternativa |
|---|------|-------------------|-------------|
| 1 | Enum `AuditAction` | Añadir `state_change` y `assign` (mustAudit); reutilizar `delete` para soft delete nota/doc | `update` genérico (rechazado: no existe en schema) |
| 2 | Rol `tecnico` | `projects.update` sobre proyectos asignados (`assertOwnership`); **sin** `projects.assign` ni `projects.delete` | Solo lectura (rechazado: contradice AC de gestión acotada) |
| 3 | Grafo de transiciones | Rechazar si estado actual `isTerminal`; rechazar mismo estado; permitir cualquier no-terminal → no-terminal; permitir no-terminal → terminal | Grafo estricto por `order` (fuera de alcance v1) |
| 4 | `first_response_at` | Primera **asignación de técnico** o primer **cambio de estado válido**, lo que ocurra antes; `UPDATE` condicional `WHERE first_response_at IS NULL` | Acción explícita separada (fuera de alcance) |

## Enfoque técnico

1. **Migración:** `ALTER TYPE` / Prisma migrate para `AuditAction` += `state_change`, `assign`. Regenerar client.
2. **Auditoría:** ampliar `AUDIT_ACTION_VALUES`, `MUST_AUDIT_ACTIONS`, `METADATA_WHITELIST` (`fromState`, `toState`, `technicianId`; `delete` con `entityType`/`entityId` en columnas).
3. **RBAC:** `ROLE_PERMISSION_RULES.tecnico` → `['projects.read', 'projects.update']`; validar `assertRbacMatrixIntegrity`; actualizar seed de role_permissions.
4. **Dominio (server-only):** cada módulo exporta función pura de caso de uso + schema Zod; errores: `ProjectNotFoundError` (404), `ForbiddenError` (403), `InvalidTransitionError` (409), validación Zod (400).
5. **Transiciones (`transitions.ts`):** cargar estados actual/destino por slug; validar reglas §3; en tx: update project, create history, `maybeSetFirstResponseAt`, `recordAudit state_change`.
6. **Asignación (`assign.ts`):** validar UUID técnico existe y rol `tecnico`; `projects.assign`; `maybeSetFirstResponseAt`; audit `assign`.
7. **Hitos/notas/docs:** CRUD acotado con `projects.update` o `projects.delete`; notas/docs soft delete con audit `delete`.
8. **Server Actions:** `'use server'`; `withPermission`; parse Zod; `db.$transaction`; `revalidatePath('/admin/proyectos/[id]')` (ruta real del App Router).
9. **PII:** cuerpo de notas y URLs de documentos **no** en `audit_logs.metadata` ni logs estructurados (solo ids y tipos).

## Patrón de transacción

```text
withPermission → parse Zod → $transaction:
  find project (deletedAt null) → 404
  assertOwnership → 403
  reglas de dominio → 409/400
  mutaciones Prisma
  maybeSetFirstResponseAt (helper compartido)
  recordAudit (mustAudit) — fallo → rollback
revalidatePath
```

## Threat model

### Superficie de ataque

- Server Actions en `app/(admin)/admin/proyectos/[id]/actions.ts` (invocables por cliente autenticado con sesión).
- Payloads: slugs de estado, UUIDs (proyecto, técnico, hito), texto libre (nota), URLs y referencias a media.
- Sin endpoints HTTP públicos nuevos.

### Actores

- Anónimo (sin sesión → 401 vía `withPermission`).
- `editor` sin permisos de proyecto (403).
- `tecnico` en proyecto ajeno o intentando asignar/borrar (403).
- `gestor`/`admin` legítimos.
- Atacante con sesión de rol inferior intentando escalada horizontal (IDOR por `projectId`).

### Datos sensibles implicados

- PII en `project_notes.body`, metadatos de contacto indirectamente vinculados al proyecto.
- Documentos: `file_url` puede apuntar a recursos con datos de cliente.
- RGPD: tratamiento en CRM B2B; soft delete; EU Neon.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | IDOR en mutaciones | `projectId` de otro técnico | Alto | `assertOwnership` antes de escribir |
| T2 | Escalada de rol | `editor` invoca Server Action | Alto | `withPermission` por acción |
| T3 | Transición ilegítima / corrupción pipeline | saltos desde terminal | Medio | Reglas 409; tx única |
| T4 | Inyección / payload malicioso | nota larga, URL, UUID inválido | Medio | Zod estricto; Prisma parametrizado |
| T5 | Fuga PII en auditoría | metadata con cuerpo de nota | Alto | Whitelist; solo slugs/UUIDs |
| T6 | Bypass de auditoría | omitir `recordAudit` | Alto | mustAudit en tx; tests |
| T7 | Repudio / inconsistencia | history sin state update | Alto | Una transacción Prisma |

Amenazas descartadas:
- Turnstile: acciones solo autenticadas en `/admin`.
- Rate limit específico: cubierto por límites admin globales (GTK-26) en volumen anómalo.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: `changeState` con rol `editor` falla con 403 sin escritura en BD.
- [ ] SEC-2: `tecnico` mutando proyecto con `assigned_technician_id` ajeno → 403.
- [ ] SEC-3: `tecnico` invocando asignación → 403 (sin `projects.assign`).
- [ ] SEC-4: transición desde terminal → 409 y filas `projects`/`project_state_history`/`audit_logs` sin cambio.
- [ ] SEC-5: `recordAudit` fallido en acción mustAudit revierte toda la transacción (test con mock).
- [ ] SEC-6: metadata de `state_change`/`assign` no contiene claves fuera de whitelist ni texto de notas.

## Verificación

- `npm run test` (módulo `projects`), `typecheck`, `lint`.
- `openspec validate --strict`.
- `/opsx:verify` antes de archive.

## Fase 2 (contrato)

- Schemas Zod por acción en `lib/projects/*-schema.ts` o colocalizados; tipos exportados para UI futura.
- `api-spec.yml`: documentar Server Actions de admin si el estándar de gobernanza lo requiere (sin OpenAPI REST nuevo).
