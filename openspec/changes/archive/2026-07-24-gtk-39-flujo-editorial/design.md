# Design — gtk-39-flujo-editorial

> US: [GTK-39](https://linear.app/geoteknia/issue/GTK-39/flujo-editorial-humano-en-el-bucle-revision-aprobacion-versionado)

## Context

GTK-41 entrega CRUD admin con bloque EDITORIAL y bloqueo Zod de `aprobado`/`publicado` en create/update. GTK-38 persiste generaciones IA sin publicar. Prisma ya define `ContentRevision` y campos `reviewed_by_id`, `approved_by_id`, `approved_at`, `current_version` en entidades publicables. Faltan el grafo centralizado, versionado y Server Actions de transición.

Las acciones CRUD viven hoy en `app/(admin)/contenido/actions.ts` (por tipo de entidad). GTK-39 añade `app/(admin)/contenido/[type]/[id]/actions.ts` para transiciones workflow, reutilizando módulos por entidad en `lib/content/*`.

## Goals / Non-Goals

**Goals:**

- Grafo único `TRANSITIONS` + `assertTransition` exportado para GTK-40.
- Registro `content_type → { load, updateWorkflow, extractBodySnapshot, extractSeoSnapshot }` para entidades EDITORIAL del alcance.
- Transición atómica: actualizar estado (+ metadatos) + revisión opcional + `recordAudit` mustAudit.
- Server Actions con `ContentActionResult` y aviso YMYL.
- Tests unitarios + QA BD de `content_revisions` y `audit_logs`.

**Non-Goals:**

- ISR, `published_at`, revalidación de rutas públicas (GTK-40).
- UI admin.
- Nuevo permiso `content.approve`.
- Re-publicación desde `despublicado` (sin transiciones definidas; error 409 si se intenta salto no listado).
- Route Handlers HTTP.

## Decisions

### D1 — Server Actions, no Route Handlers

Alineado con GTK-41 y Hallazgo 3 del ticket: mutaciones admin vía `'use server'` + `withPermission` + `runContentAction`. El contrato (fase 2) son schemas Zod en `lib/content/schemas/workflow.ts` (o similar), no entradas en `api-spec.yml` salvo nota de referencia si el estándar lo exige para Server Actions documentadas.

### D2 — Sin permiso de aprobación separado

`content.update` cubre submit, approve, reject y regenerar; `content.publish` cubre publicar y despublicar. Trazabilidad vía `approved_by_id` + audit, no 4-eyes.

### D3 — Revisiones solo al cambiar cuerpo/SEO

| Transición | ¿Revisión? | Auditoría |
|------------|------------|-----------|
| `borrador_ia → en_revision` | No | `content_update` |
| `en_revision → aprobado` | No | `approve` |
| `en_revision → rechazado` | No | `reject` |
| `aprobado → publicado` | No | `publish` |
| `publicado → despublicado` | No | `content_update` |
| `rechazado → borrador_ia` (regenerar) | Sí, si el handler persiste nuevo cuerpo | `content_update` |
| Edición de cuerpo vía CRUD (GTK-41) | Sí (futuro/enlace) | `content_update` |

Para GTK-39, `createRevision` se invoca desde el flujo de transición cuando `options.bodyChanged === true` o desde helper de regeneración que actualiza body en la misma tx.

### D4 — Contrato GTK-40

Exportar `TRANSITIONS`, `assertTransition`, `getTransitionMeta(target)` (permiso + audit action). GTK-40 importará el mismo módulo y añadirá efectos post-tx (ISR/`published_at`) sin duplicar el grafo.

### D5 — `requiresTechnicalVerification`

Extender el tipo de éxito de `ContentActionResult` con campo opcional `requiresTechnicalVerification?: boolean` en `data` del resultado de submit/approve, o `warning` string fijo acordado en tests. Preferencia: campo booleano en `data` junto a `workflowStatus` devuelto.

### D6 — Entidades en el registro polimórfico

Claves `content_type` estables (snake_case alineado con `data-model.md`): `service`, `geo_zone`, `service_zone_page`, `case_study`, `blog_post`, `faq` (y otras con bloque EDITORIAL del ticket si ya tienen módulo GTK-41). Dispatch a `getById` / `update` existentes en cada módulo.

## Risks / Trade-offs

- **[Riesgo]** Integridad polimórfica sin FK en `content_revisions` → **Mitigación:** validar existencia en dominio antes de transición; tests 404.
- **[Riesgo]** Divergencia grafo vs CRUD Zod → **Mitigación:** `assertTransition` como única fuente; CRUD ya excluye `aprobado`/`publicado`.
- **[Riesgo]** Publicar sin GTK-40 deja contenido en `publicado` sin `published_at` → **Mitigación:** documentado; GTK-40 es dependiente; tests assert `published_at` null.
- **[Trade-off]** Misma persona edita y aprueba → aceptado por producto; control YMYL por aviso técnico y obligación de pasar por `en_revision`.

## Migration Plan

Sin migración Prisma. Despliegue: merge de rama `feature/backend-gtk-39-flujo-editorial`; sin feature flags. Rollback: revertir commit; estados ya mutados permanecen (manual si necesario).

## Open Questions

- Re-publicación desde `despublicado`: pendiente negocio; grafo sin salidas → 409 hasta nueva US.
- ¿Incluir `blog_category` / `faq_group`? Solo entidades con cuerpo editorial publicable según ticket; ajustar registro a lo implementado en GTK-41.

## Threat model

### Superficie de ataque

- Server Actions autenticadas en `/admin`: transiciones de estado sobre contenido YMYL por `content_type` + UUID.
- Inputs: `contentType`, `id`, nota opcional, flags de regeneración/cuerpo.
- Sin endpoints públicos nuevos.

### Actores

- Anónimo (sin sesión) → 401.
- `tecnico` sin permisos de contenido → 403.
- `editor` con `content.update` → puede aprobar propio borrador (intencional).
- `editor` sin `content.publish` → no puede publicar.
- Atacante con sesión válida intentando IDOR sobre UUID ajeno → mitigado por RBAC global (single-org); no hay aislamiento por autor a nivel permiso.

### Datos sensibles implicados

- Contenido editorial (no PII de leads); metadatos de aprobación (`approved_by_id`) en BD EU.
- Audit logs sin cuerpo editorial ni PII.
- No prompts Claude en este change.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Publicar YMYL sin revisión | Salto de estado o bypass CRUD | Alto | Grafo + 409; CRUD bloquea `publicado`/`aprobado` |
| T2 | Escalada de privilegios | Usuario sin `content.publish` publica | Alto | `withPermission('content.publish')` en publish/unpublish |
| T3 | IDOR / UUID adivinable | Mutar contenido por id | Medio | UUID v4; 404 si no existe; permisos admin |
| T4 | Transición sin auditoría | Fallo silencioso audit | Medio | mustAudit en tx; test BD |
| T5 | Payload malicioso en nota/metadata | Inyección almacenada | Bajo | Zod límites longitud; sin HTML en audit metadata |
| T6 | Fuga de borrador en logs | Log de cuerpo | Medio | Log estructurado sin body; audit saneado |

**Descartadas:** Turnstile (no formulario público); rate limit HTTP (sin endpoint nuevo, GTK-26 opcional).

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] **SEC-1:** Server Action de transición a `publicado` sin permiso `content.publish` → `ContentActionResult` con `FORBIDDEN` (403).
- [ ] **SEC-2:** Transición `borrador_ia → publicado` → `CONFLICT` (409) sin cambio en BD.
- [ ] **SEC-3:** Sin sesión → `INVALID_SESSION` (401).
- [ ] **SEC-4:** Transición `reject` exitosa → fila `audit_logs` con `action = reject` en la misma tx (fallo audit revierte estado).
- [ ] **SEC-5:** Input `contentType` fuera del enum Zod → `VALIDATION_ERROR` (400) sin escritura.
- [ ] **SEC-6:** Metadata de auditoría en approve/reject/publish no contiene campos `body` ni snapshots.
