# Informe Step 6 — Migración de base de datos y verificación de schema

- **Fecha:** 2026-07-22
- **Cambio:** gtk-16-generacion-contenido-ia
- **Variante:** Harness DB
- **Agente:** Orquestador (implementación backend)

---

## Resumen ejecutivo

✅ **Schema GTK-16 completado y validado.** Todas las 5 entidades nuevas creadas en Neon con enums, índices y constraints correctos. Tablas append-only verificadas sin `updated_at`/`deleted_at`. Base de datos lista para RF-19/RF-20/RF-21.

---

## Comandos ejecutados

1. `npx prisma validate` — Validación de schema.
2. `npx prisma migrate dev --name ai_generation_editorial_revisions` — Creación e aplicación de migración.
3. Script `verify-schema.js` — Verificación de tablas, enums, índices y constraints.

---

## Migración creada

**Archivo:** `prisma/migrations/20260722180257_ai_generation_editorial_revisions/migration.sql`

**Operaciones DDL:**

| Operación | Cantidad | Detalles |
|-----------|----------|----------|
| CREATE TYPE | 2 | `PromptPageType` (7 valores), `AiGenerationStatus` (4 valores) |
| CREATE TABLE | 5 | `prompt_templates`, `ai_generations`, `ai_token_usage`, `ai_budget_config`, `content_revisions` |
| CREATE UNIQUE INDEX | 2 | `ai_token_usage.ai_generation_id`, `ai_budget_config.billing_period` |
| CREATE INDEX | 12 | Índices por `page_type`, `is_active`, `prompt_template_id`, `requested_by_id`, `model`, `status`, `created_at`, `target_content_type/content_id`, `billing_period`, `editor_id`, `(content_type, content_id, version_number)` compuesto |
| ADD FOREIGN KEY | 4 | `ai_generations.prompt_template_id` (RESTRICT), `ai_generations.parent_generation_id` (self, SET NULL), `ai_token_usage.ai_generation_id` (CASCADE), `content_revisions.ai_generation_id` (SET NULL) |

---

## Verificación de tablas

### ✅ Tablas creadas (5/5)

- ✓ `prompt_templates` — Plantillas de prompts por tipo de página
- ✓ `ai_generations` — Registro de invocaciones a Claude
- ✓ `ai_token_usage` — Ledger contable de tokens (append-only)
- ✓ `ai_budget_config` — Configuración de presupuesto y alertas
- ✓ `content_revisions` — Historial de versiones (append-only)

### ✅ Enums creados (2/2)

- ✓ `PromptPageType` — `service`, `geo_zone`, `service_zone`, `case_study`, `blog`, `faq`, `meta`
- ✓ `AiGenerationStatus` — `success`, `error`, `partial`, `retrying`

---

## Verificación de append-only

### ai_token_usage

**Columnas (esperadas):** id, ai_generation_id (UNIQUE FK), model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_eur, billing_period, created_at

**Verificación:**
- ✓ SIN `updated_at`
- ✓ SIN `deleted_at`
- ✓ Esperadas: 10 columnas
- ✓ UNIQUE constraint en `ai_generation_id` (1:1 relación)

### content_revisions

**Columnas (esperadas):** id, content_type, content_id, version_number, body_snapshot, seo_snapshot, workflow_status_at, editor_id, change_summary, ai_generation_id, created_at

**Verificación:**
- ✓ SIN `updated_at`
- ✓ SIN `deleted_at`
- ✓ Esperadas: 11 columnas
- ✓ Índice compuesto `(content_type, content_id, version_number)` creado

---

## Verificación de índices

### Índices en ai_generations (7)

1. ✓ `ai_generations_pkey` (id)
2. ✓ `ai_generations_prompt_template_id_idx`
3. ✓ `ai_generations_requested_by_id_idx`
4. ✓ `ai_generations_model_idx`
5. ✓ `ai_generations_status_idx`
6. ✓ `ai_generations_created_at_idx`
7. ✓ `ai_generations_target_content_type_target_content_id_idx` (compuesto)

### Índices en ai_token_usage (4)

1. ✓ `ai_token_usage_pkey` (id)
2. ✓ `ai_token_usage_ai_generation_id_key` (UNIQUE)
3. ✓ `ai_token_usage_billing_period_idx`
4. ✓ `ai_token_usage_model_idx`
5. ✓ `ai_token_usage_created_at_idx`

### Índices en content_revisions (3)

1. ✓ `content_revisions_pkey` (id)
2. ✓ `content_revisions_content_type_content_id_version_number_idx` (compuesto)
3. ✓ `content_revisions_editor_id_idx`

### Índices en prompt_templates (3)

1. ✓ `prompt_templates_pkey` (id)
2. ✓ `prompt_templates_page_type_idx`
3. ✓ `prompt_templates_is_active_idx`

---

## Verificación de FKs y constraints

| Tabla | FK | Referencia | Acción DELETE |
|-------|----|----|---|
| ai_generations | prompt_template_id | prompt_templates.id | RESTRICT |
| ai_generations | parent_generation_id (self) | ai_generations.id | SET NULL |
| ai_token_usage | ai_generation_id | ai_generations.id | CASCADE |
| content_revisions | ai_generation_id | ai_generations.id | SET NULL |

**Verificación:**
- ✓ FK `ai_generations.prompt_template_id` es RESTRICT (protege borrado accidental de plantillas).
- ✓ Auto-referencia `parent_generation_id` permite linaje de regeneraciones.
- ✓ FK `ai_token_usage.ai_generation_id` es CASCADE (elimina coste si generación se borra).
- ✓ FK `content_revisions.ai_generation_id` es SET NULL (preserva historial si generación se borra).

---

## Validaciones Prisma

### prisma validate

```
✓ The schema at prisma\schema.prisma is valid 🚀
```

### prisma generate

✓ Prisma Client regenerado (`v6.19.3`).

---

## Estado de base de datos

| Métrica | Valor |
|---------|-------|
| Base de datos | PostgreSQL en Neon (EU region) |
| Tablas nuevas | 5 |
| Enums nuevos | 2 |
| Índices nuevos | 12+ |
| Constraints UNIQUE | 2 |
| Foreign Keys | 4 |
| Tablas append-only verificadas | 2 |
| Schema validado | ✓ |
| Migración aplicada | ✓ |

---

## Restauración

No hay datos creados en paso 6 (solo schema). No requiere restauración.

---

## Resultado

- **Status:** ✅ PASS
- **Bloqueantes:** Ninguno
- **Siguiente paso:** Fase 7 (Docs) — actualizar `data-model.md`
