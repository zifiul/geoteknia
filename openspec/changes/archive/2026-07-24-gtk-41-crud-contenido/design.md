# Design — gtk-41-crud-contenido

> CRUD de contenido publicable y maestros: dominio en `lib/content/`, Server Actions en `app/(admin)/contenido/**`, entrega por olas 41a→41e.

## Decisiones de negocio (bloqueantes — Gate 1)

| # | Tema | Decisión | Alternativa descartada |
|---|------|----------|------------------------|
| 0 | Alcance del change | Épica GTK-41 en un change con **olas 41a→41e** ordenadas en `tasks.md`; revisar/archivar cuando todas las olas estén en VERDE | 14 entidades en un solo commit sin olas (riesgo XL) |
| 1 | Borrador manual | `workflow_status = borrador_ia` siempre al crear; origen manual → `is_ai_assisted = false` | Añadir enum `borrador` (migración innecesaria) |
| 2 | Auditoría de edición | Nuevo `AuditAction.content_update` (mustAudit) + reutilizar `delete` en soft delete; whitelist metadata (`entityType`, `entityId`, `slug` opcional) | `update` genérico (ambiguo con CRM) |
| 3 | Config singleton | `organization_profile`, `contact_channels`, `calculator_rules` (mutación): solo rol `admin` (check explícito), sin permiso `config.*` | Nuevos permisos `config.*` (MVP) |
| 4 | Media / env | `MEDIA_STORAGE_BASE_URL` obligatoria en `envSchema`; CRUD de `media_assets` registra `file_url` (absoluta o prefijada); **sin** upload de ficheros en este ticket | Integración S3/R2 (ticket futuro) |
| 5 | `word_count` geo-zona | Calcular desde `body`; si &lt; 800 devolver **warning** en resultado de acción; no bloquear guardado | Bloqueo duro (pendiente negocio) |
| 6 | Publicación | Schemas Zod de entrada **rechazan** `workflow_status = publicado` y `aprobado` en create/update CRUD | Permitir publicar desde CRUD (GTK-40) |

## Enfoque técnico

1. **Migración:** `AuditAction` += `content_update`; actualizar `lib/audit/actions.ts`, `sanitize.ts`, `MUST_AUDIT_ACTIONS`.
2. **Fundamentos (41a):** `slugify` + `ensureUniqueSlug` por delegate Prisma; errores de dominio mapeados a códigos de acción; `seoBlockSchema`, `editorialCrudBlockSchema` (estados no publicados); `contentActionResult` alineado con `projectActionResult`.
3. **Por entidad (41b–41e):** módulo server-only con schemas Zod (cuerpo + SEO + editorial donde aplique), funciones `create/update/softDelete/get/list` con `deleted_at: null` en lecturas; M:N en transacción con validación de IDs existentes (400 si referencia inválida); `content_media` polimórfica validada en dominio.
4. **Server Actions:** `'use server'`; `withPermission('content.create'|'content.update'|'content.delete')` o `requireAdmin()` para config; parse Zod; `db.$transaction`; `recordAudit({ tx })` en update/delete; `revalidatePath` bajo `/admin/contenido/...` cuando exista ruta.
5. **Listados admin:** paginación (`take`/`skip` o cursor simple), `select` acotado.
6. **Observabilidad:** log estructurado con `entityType`, `entityId`, `userId` — sin cuerpos SEO ni PII.

## Patrón de transacción

```text
withPermission | requireAdmin
  → parse Zod
  → $transaction:
      reglas slug / M:N / editorial
      mutaciones Prisma
      recordAudit (content_update | delete) si aplica — fallo → rollback
  → revalidatePath (opcional)
  → ContentActionResult { ok, data?, warning?, error? }
```

## Threat model

### Superficie de ataque

- Server Actions bajo `app/(admin)/contenido/**` (cliente autenticado con sesión).
- Payloads: texto HTML/markdown editorial, URLs canónicas, UUIDs de relaciones M:N, slugs, metadatos SEO.
- Sin endpoints HTTP públicos nuevos.

### Actores

- Anónimo → 401 (`withPermission`).
- `tecnico` (sin `content.*`) → 403 en todo CRUD de contenido.
- `editor` con `content.*` legítimo.
- `gestor` sin permisos de contenido → 403.
- `admin` para singletons de config.
- Atacante con sesión inferior intentando publicar o mutar config.

### Datos sensibles implicados

- Contenido no publicado (competitivo/SEO); no PII de leads.
- RGPD: datos en EU; soft delete.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Escalada RBAC | `tecnico`/`gestor` invoca action | Alto | `withPermission` / `requireAdmin` |
| T2 | Publicación no autorizada | payload con `publicado` | Alto | Zod editorial + tests |
| T3 | Slug squatting / colisión | slug duplicado | Medio | Unique en BD + 409 |
| T4 | Referencias M:N rotas | UUIDs inventados | Medio | Validación previa 400 |
| T5 | XSS almacenado en frontal | HTML en cuerpo | Medio | Sanitización en render público (GTK-40); validación longitud/tipo en CRUD |
| T6 | Fuga en auditoría | metadata con cuerpo SEO | Alto | Whitelist `content_update` |
| T7 | IDOR por UUID | leer/editar por id | Medio | Solo portal admin autenticado; permiso `content.*` global por rol (single-org) |

Amenazas descartadas:
- Turnstile: solo `/admin` autenticado.
- Rate limit dedicado: límites admin globales (GTK-26).

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: crear contenido con rol `tecnico` → 403 sin escritura en BD.
- [ ] SEC-2: update/delete de `organization_profile` con rol `editor` → 403.
- [ ] SEC-3: payload con `workflow_status=publicado` → 400 sin persistir.
- [ ] SEC-4: slug duplicado en mismo silo → 409 sin segunda fila activa.
- [ ] SEC-5: `content_update`/`delete` generan `audit_logs` en la misma transacción; fallo de audit revierte.
- [ ] SEC-6: metadata de auditoría sin campos fuera de whitelist (p. ej. sin `body`).
