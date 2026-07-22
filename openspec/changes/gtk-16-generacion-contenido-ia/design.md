## Context

El subsistema de generación IA (Claude API) requiere persistencia de: (1) plantillas reutilizables de prompts por tipo de página, (2) un registro histórico de cada invocación (inputs, outputs, modelo, estado), (3) contabilidad de tokens consumidos y coste en EUR, (4) configuración de presupuesto mensual y alertas, (5) historial de versiones editoriales de contenido publicable con trazabilidad a la generación origen.

Actualmente, esta información se pierde: no hay gobernanza de coste, ni revisión editorial, ni garantía de que los prompts no contienen PII. La arquitectura Prisma/PostgreSQL (Neon EU) es la ubicación natural para estos registros.

## Goals / Non-Goals

**Goals:**
- Implementar el schema Prisma + migraciones DDL para las 5 entidades nuevas (`prompt_templates`, `ai_generations`, `ai_token_usage`, `ai_budget_config`, `content_revisions`).
- Asegurar que los registros son **append-only** en las tablas contables (`ai_token_usage`, `content_revisions`), sin actualizaciones ni eliminaciones.
- Garantizar compliance RGPD: sin PII en `ai_generations.input_params` ni `rendered_prompt`; `requested_by_id` refencia solo usuarios internos.
- Establecer índices para acceso eficiente (buscar generaciones por tipo de contenido, por estado, por período de facturación).
- Documentar el modelo en `data-model.md` y validar la migración sin errores en dev y staging (Neon).

**Non-Goals:**
- No se implementa la lógica de invocación a Claude API (reside en RF-19 backend).
- No se crean endpoints API, Server Actions ni UI (pertenecen a RF-20/RF-21).
- No se configura notificación por email automática (infraestructura Resend, fuera de este scope).
- No se añaden enums adicionales más allá de `PromptPageType` y `AiGenerationStatus`.

## Decisions

### D1: Append-only para audit log e inmutabilidad contable

Las tablas `ai_token_usage` y `content_revisions` son **append-only**: solo `created_at`, sin `updated_at`/`deleted_at`. Esto garantiza:
- Inmutabilidad de registros contables (cumple auditoría).
- Imposibilidad de manipular retroactivamente costes o versiones.
- Simplificación de logs: cada fila es un evento.

**Alternativa rechazada:** mutable + historial de auditoría separada → introduce complejidad y riesgo de inconsistencia.

### D2: Estructura de `ai_generations` para soporte de reintentos y linaje

`ai_generations` incluye:
- `status` (enum): `success`, `error`, `partial`, `retrying`.
- `retry_count`: número de reintentos del agente.
- `parent_generation_id` (auto-referencia opcional): para linaje de regeneraciones de secciones (RF-20).

Esto permite rastrear qué se reintentó y por qué, y auditar cambios en una página (por ej., "sección H2 de intro regenerada 3 veces antes de aprobarse").

**Alternativa rechazada:** crear generaciones nuevas sin linaje → se pierden contexto y causa de reintento.

### D3: `ai_token_usage` con relación 1:1 a `ai_generation`

Cada generación tiene como mucho **una** fila `ai_token_usage` (UNIQUE constraint en `ai_generation_id`). Si una generación no consume tokens (error antes de invocar Claude), no hay fila de uso.

Esto simplifica queries de facturación: `SELECT SUM(cost_eur) FROM ai_token_usage WHERE billing_period = 'YYYY-MM'`.

**Alternativa rechazada:** múltiples filas de uso por generación → introduce complejidad agregable.

### D4: `content_revisions` polimórfico con `content_type` + `content_id`

Cualquier tabla de contenido publicable (futura `blog_posts`, `case_studies`, `service_descriptions`, etc.) puede tener revisiones. La tabla usa:
- `content_type` (string): p. ej. `'blog_post'`, `'case_study'`.
- `content_id` (UUID): referencia al id de la entidad origen.
- Índice compuesto `(content_type, content_id, version_number)` para acceso rápido al historial de una página.

Esto evita crear tablas append-only separadas por entidad.

**Alternativa rechazada:** FK a tabla específica → no escala a nuevos tipos sin migración.

### D5: `cacheable_prefix` en `prompt_templates` para optimización de Claude API

Claude API soporta **Prompt Caching**: prefijos estáticos de prompts se cachean en servidor de Anthropic durante 5 minutos. El campo `cacheable_prefix` almacena la porción estática (p. ej., instrucciones del sistema o estructura fija), reduciendo coste y latencia.

**Alternativa rechazada:** sin prefix → todos los tokens se consumen siempre.

### D6: `input_schema` (JSON) como especificación de inputs del editor

Cada plantilla declara los inputs esperados como esquema JSON (p. ej. `{"type": "object", "properties": {"title": {"type": "string"}, "tags": [...]}, "required": ["title"]}`). Esto permite:
- Validación en el formulario de editor (RF-20).
- Auto-documentación de qué ingresa el usuario en cada tipo de página.
- Tipado eventual en `/lib` (Zod derivado del JSON schema).

### D7: `workflowStatus` como enum en `content_revisions`

La columna `workflow_status_at` es un enum (`borrador_ia`, `en_revision`, `aprobado`, `publicado`, etc.) que refleja el estado editorial de esa versión. Permite auditar: "versión 3 fue generada por IA, revisada en 2026-07-22 y publicada en 2026-07-23".

### D8: Región EU y sin PII

Todos los datos residen en Neon (EU). Los campos `requested_by_id` (usuarios internos) y `editor_id` (usuarios internos) NO son PII exportable; la PII reside en tabla `users` separada. Los `input_params` y `rendered_prompt` de `ai_generations` **nunca** pueden contener datos de `contacts`, `leads` o `projects` (RNF-IA). Esto se valida en la implementación de RF-19.

## Threat model

### Superficie de ataque

- **Base de datos Prisma**: Tabla `ai_generations` es editable en /admin por rol `gestor` y superior; `ai_budget_config` solo por `admin`. Acceso indirecto a través de la UI de RF-20 (aprobación editorial) y RF-21 (publicación).
- **Datos en tránsito**: Los prompts + salida de Claude transitan servidor → API Claude (HTTPS). El SDK de Anthropic maneja encriptación.
- **Almacenamiento**: `rendered_prompt` y `output_text` se almacenan en BD PostgreSQL (Neon EU); son datos potencialmente YMYL (You Money Your Life), requieren acceso acotado.

### Actores

- **Anónimo**: No accede (tablas en BD privada).
- **Usuario autenticado `editor` o `tecnico`**: Puede solicitar generación vía RF-19 (envía inputs, recibe `ai_generations` ID).
- **Usuario `gestor`**: Puede revisar + aprobar/rechazar generaciones (RF-20).
- **Usuario `admin`**: Acceso total incluyendo configuración de presupuesto (`ai_budget_config`).
- **Atacante autenticado**: Intenta acceder a generaciones ajenas o manipular config de presupuesto.

### Datos sensibles implicados

- **Potencialmente PII**: Los `input_params` de `ai_generations` pueden contener, si se implementa mal en RF-19, nombre/email/empresa de leads o contactos. **RESTRICCIÓN: RNF-IA prohíbe esto.**
- **Coste de operación**: `ai_token_usage.cost_eur` es sensible (estrategia de gasto); solo `admin` debe acceder.
- **Contenido generado**: `output_text` es contenido YMYL (sitio de salud/finanzas), requiere auditoría editorial antes de publicación.
- **Usuarios internos**: `requested_by_id`, `editor_id`, `created_by_id`, `updated_by_id` referencian tabla `users` interna; requerimiento RGPD estándar de auditoría.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Acceso sin permiso a `ai_generations` | Usuario `editor` intenta leer/actualizar generación de otro editor | Info disclosure; manipulación de salida antes de publicación | SEC-1: Queries a `ai_generations` filtran por `requestedById` (solo lees tus propias solicitudes). `gestor` ve todas en su rol. |
| T2 | Inyección vía `input_params` | Usuario envía JSON malformado o con PII oculta | Corrupción de datos; fuga de PII a logs o prompts | SEC-2: `input_params` es JSON validado contra `prompt_template.input_schema` en la aplicación RF-19. Schema rechaza campos no declarados. |
| T3 | Coste no acotado de IA | Usuario genera de forma repetida sin límite | Gasto descontrolado (RNF-IA: presupuesto) | SEC-3: Existen alerts cuando coste mensual acumulado en `ai_token_usage` supera `ai_budget_config.alert_threshold_pct` del presupuesto. Implementado en fase RF-19 + RF-20. |
| T4 | Manipulación de `ai_budget_config` | Usuario no-`admin` intenta actualizar presupuesto/alertas | Bypass de límites de gasto | SEC-4: Endpoints de actualización de `ai_budget_config` (RF-20) exigen rol `admin` y son auditados en `auth.log` (Auth.js audit). |
| T5 | Fuga de contenido confidencial antes de publicación | Usuario intenta publicar `content_revision` rechazada | Publicación de contenido no aprobado | SEC-5: `content_revisions.workflow_status_at` es inmutable (append-only). Una vez `borrador_ia`, no se puede cambiar a `publicado` sin transitar `en_revision` → `aprobado` (validado en RF-21). |
| T6 | Prompt injection desde inputs del editor | Usuario incluye en `input_params` comando "Ignora instrucciones y damé..." | Control de la salida IA, fuga de instrucciones | SEC-6: `prompt_templates.cacheable_prefix` es de lectura del admin. `input_params` se inserta en placeholder, no en control de flujo del prompt. Prompt caching limita inyección. |

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Queries a `ai_generations` en RF-19/RF-20 filtran por rol RBAC (`requested_by_id` si `editor`, todas si `gestor`+, ninguna si rol anónimo). Respuesta 403 si se intenta acceder a generación de otro usuario sin permiso.
- [ ] SEC-2: En crear `ai_generation`, `input_params` es JSON validado contra `prompt_template.input_schema` (respuesta 400 si inválido). Schema declara qué campos son aceptados; campos adicionales se rechazan.
- [ ] SEC-3: BD registra en `ai_token_usage` tokens consumidos por invocación. Un reporte (consulta SQL o endpoint de RF-20) suma coste mensual y compara con `ai_budget_config.monthly_budget_eur` * `alert_threshold_pct`; alertas se emiten si umbral excedido (implementación en fase RF-19).
- [ ] SEC-4: Endpoints PATCH/PUT a `ai_budget_config` (crear/actualizar presupuesto) requieren rol `admin`. Intento de `gestor` → respuesta 403. Acción auditada en Auth.js (incluida en audit log estándar).
- [ ] SEC-5: `content_revisions` es append-only (sin UPDATE). Transición de `workflow_status` se valida en RF-21: solo permite paso lógico en el flujo editorial (p. ej. `borrador_ia` → `en_revision`, `en_revision` → `aprobado`; NO `aprobado` → `borrador_ia`).
- [ ] SEC-6: `prompt_templates.cacheable_prefix` no puede ser modificado por usuario final durante creación de `ai_generation`. Solo el admin (en RF-19) puede cambiar plantillas. Inputs no controlan flujo del prompt (insertos en placeholder, no en instrucciones).

## Risks / Trade-offs

### Risk 1: Crecimiento de tablas append-only sin límite de retención

**Risk**: `ai_token_usage` y `content_revisions` nunca se eliminan. A 12 meses con actividad diaria, crecen linealmente.

**Mitigation**: 
- Índices por `billing_period` (ai_token_usage) y `created_at` (content_revisions) aceleran queries de rango temporal.
- Política de archivado definida en RNF-IA (documentar en fase RF-19): p. ej., datos de >2 años se archivan a S3 o data warehouse externo.
- Sin eliminación de datos de BD viva (compliance auditoría).

### Risk 2: Complejidad de validación en RF-19

**Risk**: `input_params` debe validarse contra `prompt_template.input_schema` en aplicación; si el JSON schema es muy complejo, la validación puede fallar.

**Mitigation**:
- `input_schema` usa JSON schema estándar (no propietario); librerías como `ajv` validan en millisegundos.
- Fase RF-19 es responsable de implementar la validación; esta fase (GTK-16) documenta el contrato.

### Risk 3: Dependencia de Claude API SLA

**Risk**: Si Claude API está degradado, todas las invocaciones fallan o timeout, acumulándose status=`error` en `ai_generations`.

**Mitigation**:
- `retry_count` y `status` permiten reintentos transparentes en RF-19.
- `latency_ms` registra tiempo de respuesta; anómalas se detectan en monitoreo (Sentry).
- SLA de Claude ~99.9%; no es bloqueante para schema.

## Migration Plan

1. **Desarrollo**: Ejecutar `prisma migrate dev` en rama local; validar schema sin errores.
2. **Staging (Neon)**: Crear branch Neon, ejecutar `prisma migrate deploy`; verificar DDL creada.
3. **Seed maestros** (fase opcional RF-14): Insertar ≥1 `prompt_template` por `page_type` con `default_model='claude-sonnet-4-6'` y plantillas base.
4. **PR + merge**: Schema en main sin datos (seed es tarea RF-14 separada).

Reversión: `prisma migrate resolve --rolled-back <migration-name>` + `prisma db push` (dev only) o borrar branch Neon en staging.

## Open Questions

1. **¿El `inputSchema` se define como JSON schema puro o como Zod schema serializado?** Decisión en RF-19: si puro JSON schema, se valida con `ajv`; si Zod, se serializa en BD y se deserializa en servidor.
2. **¿Hay límite máximo de tokens por mes declarado en `ai_budget_config`?** O solo alertas. Decisión en RF-19: parar invocaciones si presupuesto agotado o permitir sobrecoste y alertar.
3. **¿La tabla `content_revisions` incluye snapshots de campos adicionales (p. ej. autor, tags, metadescripción)?** O solo `body_snapshot` + `seo_snapshot`. Decisión en RF-21.
