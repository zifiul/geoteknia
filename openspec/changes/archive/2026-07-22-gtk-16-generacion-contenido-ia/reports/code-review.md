# Informe Code Review — GTK-16: Generación de contenido IA y flujo editorial

- **Fecha:** 2026-07-22
- **Cambio:** gtk-16-generacion-contenido-ia
- **Variante:** Harness DB
- **Reviewer:** Code Reviewer (checklist schema de Geoteknia)

---

## Resumen ejecutivo

✅ **APTO PARA MERGE.** El schema de GTK-16 cumple todos los estándares técnicos, de seguridad y RGPD del proyecto. Las 5 entidades nuevas, enums y índices son coherentes con el modelo de datos vivo. No hay hallazgos bloqueantes.

---

## Cambios a revisar

| Artefacto | Cambios | Estado |
|-----------|---------|--------|
| `prisma/schema.prisma` | + 2 enums (`PromptPageType`, `AiGenerationStatus`) + 5 modelos (prompt_templates, ai_generations, ai_token_usage, ai_budget_config, content_revisions) | ✅ APTO |
| `prisma/migrations/20260722180257_ai_generation_editorial_revisions/migration.sql` | DDL de creación de tipos, tablas e índices | ✅ APTO |
| `docs/technical/data-model.md` | Documentación actualizada con 4.12 (IA, Coste y Versionado) | ✅ APTO |

---

## Checklist Code Review — Schema (Harness DB)

### ✅ Fundación y Convenciones

- [x] **UUIDs como PK**: Todas las 5 entidades usan `id UUID @id @default(uuid()) @db.Uuid`. ✓
- [x] **Nombres en snake_case**: Tablas y columnas usansnake_case con `@@map` y `@map`. Ej: `prompt_templates`, `page_type`. ✓
- [x] **Enums tipificados**: 2 enums nuevos correctamente delimitados (`PromptPageType`, `AiGenerationStatus`). ✓

### ✅ Bloques AUDIT y Append-Only

- [x] **Bloque AUDIT en entidades mutables**: `prompt_templates` y `ai_budget_config` incluyen `created_at`, `updated_at`, `deleted_at`, `created_by_id`, `updated_by_id`. ✓
- [x] **Append-only verificadas**: 
  - `ai_token_usage`: SIN `updated_at`/`deleted_at`. Solo `created_at`. ✓
  - `content_revisions`: SIN `updated_at`/`deleted_at`. Solo `created_at`. ✓
- [x] **Soft delete selectivo**: Solo entidades mutables lo incluyen. Append-only no. ✓

### ✅ Relaciones y Foreign Keys

- [x] **FK de restricción**: `ai_generations.prompt_template_id` es FK RESTRICT (protege eliminar plantilla usada). ✓
- [x] **Auto-referencia**: `ai_generations.parent_generation_id` es self-FK opcional (nullable, SET NULL). Permite linaje de regeneraciones. ✓
- [x] **Cascadas apropiadas**: 
  - `ai_token_usage.ai_generation_id` es CASCADE (elimina coste si generación se borra). ✓
  - `content_revisions.ai_generation_id` es SET NULL (preserva versiones si generación se borra). ✓

### ✅ Uniqueness y Constraints

- [x] **UNIQUE en 1:1**: `ai_token_usage.ai_generation_id` es UNIQUE. Garantiza 1:1 relación. ✓
- [x] **UNIQUE global**: `ai_budget_config.billing_period` es UNIQUE nullable. Permite múltiples periodos específicos pero solo uno global (NULL). ✓

### ✅ Índices para Rendimiento

- [x] **Índices por busqueda frecuente**:
  - `prompt_templates(page_type)`: filtrar plantillas por tipo de página. ✓
  - `prompt_templates(is_active)`: listar plantillas vigentes. ✓
  - `ai_generations(prompt_template_id)`: invocaciones de plantilla. ✓
  - `ai_generations(requested_by_id)`: generaciones de usuario. ✓
  - `ai_generations(model)`: análisis de gasto por modelo. ✓
  - `ai_generations(status)`: monitoreo de fallos. ✓
  - `ai_generations(created_at)`: audit trail temporal. ✓
  - `ai_generations(target_content_type, target_content_id)`: encontrar generaciones de un contenido (polimórfico). ✓
  - `ai_token_usage(billing_period)`: agregación mensual de coste. ✓
  - `ai_token_usage(model)`: análisis de coste por modelo. ✓
  - `ai_token_usage(created_at)`: reportes temporales. ✓
  - `content_revisions(content_type, content_id, version_number)` **compuesto**: historial de una página. ✓
  - `content_revisions(editor_id)`: revisiones de usuario. ✓

- [x] **Sin over-indexing**: Índices necesarios, no redundantes. ✓

### ✅ Seguridad y RGPD

- [x] **PII no en IA**: 
  - `ai_generations.input_params` y `rendered_prompt` documentados como "sin PII". ✓
  - Comentarios en el schema advierten al implementador. ✓
  - `requested_by_id` refencia tabla `users` (usuarios internos, no clientes). ✓

- [x] **Región EU**: PostgreSQL en Neon EU. Cumple RGPD/LOPDGDD. ✓

- [x] **Integridad de datos polimórficos**: 
  - `ai_generations.target_content_type` + `target_content_id` sin FK relacional (Prisma no soporta polimorfismo). ✓
  - Documentación advierte que la integridad se valida en `/lib`. ✓
  - Índice compuesto acelera búsquedas. ✓
  - Igual en `content_revisions`. ✓

### ✅ Modelado de Dominio

- [x] **Prompt caching soportado**: `prompt_templates.cacheable_prefix` @db.Text opcional. Optimiza invocaciones a Claude API. ✓

- [x] **JSON schema configurable**: `prompt_templates.input_schema` almacena esquema de inputs esperados del editor. Flexible. ✓

- [x] **Versionado de plantilla**: `prompt_templates.version` permite evolucionar sin sobreescribir. ✓

- [x] **Linaje de regeneraciones**: `ai_generations.parent_generation_id` + `is_section_regeneration`. Audita cambios en una página. ✓

- [x] **Workflow status en content_revisions**: `workflow_status_at` enum refleja estado editorial (borrador_ia → en_revision → aprobado → publicado). ✓

- [x] **Snapshots de revisión**: `body_snapshot` + `seo_snapshot` en JSON. Historial completo sin actualización. ✓

### ✅ Threat Model: Requisitos de Seguridad (Shift-Left)

Del threat model en `design.md`, verificamos que el schema soporta los 6 requisitos SEC-1 a SEC-6:

- [x] **SEC-1: Acceso sin permiso a generaciones**: `requested_by_id` permite filtrar por usuario en queries. ✓
- [x] **SEC-2: Inyección vía input_params**: JSON validable contra `input_schema` en `/lib`. ✓
- [x] **SEC-3: Coste no acotado**: `ai_token_usage` + `ai_budget_config` permiten agregación y alertas. ✓
- [x] **SEC-4: Manipulación de presupuesto**: `ai_budget_config` con AUDIT (createdById, updatedById). Auditable. ✓
- [x] **SEC-5: Flujo editorial ilegal**: `content_revisions` append-only impide retroceso. Transiciones validadas en `/lib`. ✓
- [x] **SEC-6: Prompt injection**: `cacheable_prefix` es administrador-only. `input_params` en placeholders. ✓

### ✅ Compatibilidad con Estándares

- [x] **`base-standards.md`**: Schema sigue convenciones UUID, snake_case, bloques AUDIT. ✓
- [x] **`backend-standards.md`**: Integridad en `/lib`, sin PII en IA, campos escalares para referencias internas (`requested_by_id`, `editor_id`, `created_by_id`). ✓
- [x] **`data-model.md`**: Entidades documentadas en sección 4.12 con relaciones coherentes. ✓

### ✅ Validación Técnica

- [x] **Prisma validate OK**: Schema es válido. ✓
- [x] **Migraciones SQL correctas**: DDL sin errores. CREATE TYPE, CREATE TABLE, ADD CONSTRAINT, CREATE INDEX. ✓
- [x] **Prisma Client generado**: v6.19.3. ✓

---

## Hallazgos

### 🟢 Sin hallazgos bloqueantes

Todos los criterios pasan.

### 🔵 Observaciones (no bloqueantes)

1. **Polimorfismo de contenido**: `ai_generations.target_content_type` + `target_content_id` y `content_revisions(content_type, content_id)` no tienen FK relacional. Esto es intencional (Prisma no soporta polimorfismo nativo). La integridad se valida en `/lib`. **Impacto: bajo, documentado.**

2. **Append-only sin borrado**: `ai_token_usage` y `content_revisions` crecen sin límite. Se recomienda política de archivado a data warehouse externo pasados 2 años (a definir en RF-19/RF-20). **Impacto: bajo (a mediano plazo), documentado en `design.md`.**

3. **Modelo Claude en AiModel enum**: Actualmente solo `claude-sonnet-4-6` y `claude-opus-4-8`. Si se añaden más modelos, requiere migración enum. **Impacto: bajo, predecible.**

---

## Criterios de Aceptación (Harness DB)

| Criterio | Resultado |
|----------|-----------|
| `prisma validate` OK | ✅ PASS |
| `prisma migrate dev` sin errores | ✅ PASS |
| 5 tablas nuevas creadas | ✅ PASS |
| 2 enums nuevos creados | ✅ PASS |
| Índices según spec | ✅ PASS |
| AUDIT en mutables | ✅ PASS |
| Append-only sin `updated_at`/`deleted_at` | ✅ PASS |
| 1:1 en `ai_token_usage.ai_generation_id` | ✅ PASS |
| Auto-referencia en `parent_generation_id` | ✅ PASS |
| Índice compuesto en `content_revisions` | ✅ PASS |
| Security shift-left (threat model) | ✅ PASS |
| Documentación en `data-model.md` | ✅ PASS |

---

## Veredicto

### ✅ **Veredicto: APTO**

El schema de GTK-16 es correcto, seguro y listo para despliegue. Cumple todos los estándares técnicos, de seguridad (shift-left) y RGPD del proyecto. No hay bloqueos funcionales ni de seguridad.

**Recomendaciones para implementación (RF-19/RF-20/RF-21):**
1. Validar que `input_params` en `/lib` nunca contenga PII de contacts/leads/projects.
2. Implementar alertas de presupuesto cuando gasto alcance `ai_budget_config.alert_threshold_pct`.
3. Definir política de archivado de `ai_token_usage` y `content_revisions` pasados 2 años.

---

**Reviewer:** Code Review Gate  
**Fecha:** 2026-07-22  
**Estado:** Aprobado para merge
