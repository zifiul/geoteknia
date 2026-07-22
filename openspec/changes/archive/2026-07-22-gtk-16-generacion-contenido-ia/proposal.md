## Why

Materializar el subsistema de **gobernanza y trazabilidad de la generación IA** (Claude API) que soporta el flujo editorial de contenido publicable en Geoteknia. Sin este subsistema, no hay: (1) control de coste de tokens/mes, (2) historial de versiones editorial, (3) linaje de regeneraciones, (4) garantía de que los prompts no contienen PII. Esto bloquea las capacidades de contenido asistido (RF-19, RF-20, RF-21) y el RNF-IA (presupuesto y alertas).

## What Changes

- **Nueva entidad `prompt_templates`**: Plantillas de prompts parametrizadas por tipo de página (`service`, `geo_zone`, `service_zone`, `case_study`, `blog`, `faq`, `meta`), con bloque cacheable para optimización de Claude API.
- **Nueva entidad `ai_generations`**: Registro 1:N de cada invocación a Claude, almacenando inputs, salida, modelo, estado y reintentos. Permite tracear qué se generó, cuándo, por quién y con qué resultado.
- **Nueva entidad `ai_token_usage`** (append-only): Ledger contable de tokens consumidos (input, output, cache read/write) y coste en EUR por generación, agregable por período de facturación (billing_period).
- **Nueva entidad `ai_budget_config`**: Configuración global y por período de presupuesto mensual en EUR, umbrales de alerta, overrides de modelo por tipo de página y correos de notificación.
- **Nueva entidad `content_revisions`** (append-only): Historial de versiones polimórfico de cualquier contenido publicable (tipo, id, snapshot del body/SEO, status de workflow, editor, cambio de resumen, referencia a generación IA).

Todas las entidades incluyen bloques AUDIT (created_at, updated_at, deleted_at, created_by_id, updated_by_id) excepto las append-only que solo tienen created_at. Los campos no contienen PII (RNF-IA); `ai_generations.requested_by_id` y `content_revisions.editor_id` referencian usuarios internos.

## Capabilities

### New Capabilities

- `ai-generation-workflow`: Subsistema de invocaciones a Claude, almacenamiento de inputs/outputs y reutilización de prompts plantillas. Soporta reintentos y linaje (parent_generation_id).
- `ai-token-accounting`: Ledger append-only de tokens consumidos (input, output, cache) y coste en EUR agregable por período de facturación.
- `ai-budget-governance`: Configuración de presupuesto mensual, umbrales de alerta y notificaciones por email cuando se alcance el % configurado.
- `content-revision-history`: Historial append-only de versiones editoriales de contenido publicable, con snapshot de body/SEO, status de workflow y trazabilidad a la generación IA origen.

### Modified Capabilities

- `schema-foundation`: Se añaden los enums `PromptPageType` y `AiGenerationStatus` a la base de tipos del schema.

## Impact

- **Base de datos Prisma**: 5 nuevas tablas + 2 enums + índices y FKs documentados en el schema.
- **Dependencias**: Ninguna nueva (Prisma y PostgreSQL ya existentes).
- **RGPD/Seguridad**: Cumple con RNF-IA: sin PII en inputs/outputs de IA, region EU, campos append-only inmutables para auditoría.
- **Integración con IA**: Sustenta las capacidades RF-19 (generación), RF-20 (revisión/aprobación) y RF-21 (publicación/versionado) del stack de IA de Geoteknia.

## Fuera de alcance

- Implementación de la lógica de invocación a Claude API (reside en `/lib/content/ai-generation-service.ts` del harness completo de RF-19).
- UI/formularios de aprobación editorial (pertenece a RF-20 backend + RF-21 UI).
- Notificación por email automática de alertas (infraestructura Resend/email, fuera del modelo).
