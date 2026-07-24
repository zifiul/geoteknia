# ai-generation-workflow Specification

## Purpose

Subsistema de invocaciones a Claude con plantillas parametrizadas, registro de inputs/outputs, reintentos y linaje de regeneraciones. Materializa GTK-16, GTK-38 (endpoint admin) y soporta RF-19 (generación de contenido IA).

## Requirements

### Requirement: Almacenar plantillas de prompts parametrizadas

El sistema SHALL almacenar plantillas de prompts reutilizables, cada una parametrizada para un tipo de página específico (`service`, `geo_zone`, `service_zone`, `case_study`, `blog`, `faq`, `meta`). Cada plantilla incluye:
- Cuerpo de prompt con placeholders `{{key}}`.
- Esquema JSON de inputs esperados del editor.
- Modelo de Claude por defecto (p. ej. `claude-sonnet-4-6`).
- Bloque cacheable opcional (prefijo estático para Prompt Caching).
- Versión y estado activo/inactivo.

#### Scenario: Crear plantilla de prompts para blog

- **WHEN** admin crea una `prompt_template` con `page_type='blog'`, `template_body="Escribe un artículo de blog sobre {{tema}} en 500 palabras..."`, `cacheable_prefix="Eres un redactor especializado en geotecnia..."`, `input_schema={"type": "object", "properties": {"tema": {"type": "string"}}}`
- **THEN** la plantilla se almacena con `version=1`, `is_active=true` y puede ser referenciada en generaciones futuras

#### Scenario: Listar plantillas activas por tipo de página

- **WHEN** la UI de RF-19 solicita plantillas para `page_type='case_study'`
- **THEN** se retornan todas las plantillas con `is_active=true` y `page_type='case_study'` ordenadas por `created_at` descendente

### Requirement: Registrar cada invocación a Claude con inputs y outputs

El sistema SHALL crear una fila `ai_generation` por cada invocación a Claude, capturando:
- ID de plantilla (`prompt_template_id`).
- Parámetros de entrada validados contra el esquema de la plantilla (`input_params`, JSON).
- Prompt renderizado (después de sustituir placeholders, `rendered_prompt`).
- Salida bruta de Claude (`output_text`).
- Salida estructurada opcional (H1/H2-H3/meta/schema, `output_structured`, JSON).
- Estado: `success`, `error`, `partial`, `retrying`.
- Usuario que solicita (`requested_by_id`).
- Modelo Claude utilizado (`model`).
- Latencia en ms (`latency_ms`).
- Contador de reintentos (`retry_count`).
- Referencia a la generación padre si es una regeneración (`parent_generation_id`).

#### Scenario: Solicitar generación de contenido

- **WHEN** usuario `editor` invoca RF-19 con plantilla `id=uuid_blog`, `input_params={"tema": "Riesgos sísmicos en Madrid"}`
- **THEN** se crea `ai_generation` con `status='retrying'` (initial), `prompt_template_id=uuid_blog`, `input_params=...`, `requested_by_id=usuario_id`, `model='claude-sonnet-4-6'`

#### Scenario: Generación exitosa

- **WHEN** Claude retorna output exitoso con latencia 2500ms
- **THEN** se actualiza `ai_generation` con `status='success'`, `output_text=...`, `latency_ms=2500`, `retry_count=0`, se crea fila asociada en `ai_token_usage` con tokens consumidos

#### Scenario: Generación con error

- **WHEN** Claude retorna error (rate limit, timeout, content policy)
- **THEN** se registra `status='error'`, `error_message='...'`, `retry_count` se incrementa y el sistema permite reintentar (RF-19 maneja reintento)

#### Scenario: Regeneración de sección

- **WHEN** usuario aprueba versión 1 pero solicita regenerar solo el H2 de introducción, creando una generación nueva
- **THEN** se crea nueva `ai_generation` con `parent_generation_id=uuid_v1_generacion`, `is_section_regeneration=true`, formando un árbol de linaje

### Requirement: Rastrear generaciones por contenido destino

El sistema SHALL permitir localizar todas las generaciones asociadas a un contenido publicable (p. ej. un blog post) usando `target_content_type` y `target_content_id`.

#### Scenario: Buscar generaciones de una página de servicio

- **WHEN** consulta `ai_generations` con `target_content_type='service'`, `target_content_id=uuid_service`
- **THEN** retorna todas las generaciones (exitosas y fallidas) que tocaron esa página, ordenadas por `created_at`

#### Scenario: Auditar cambios de versión

- **WHEN** usuario visualiza historial de una página en RF-21
- **THEN** se muestran todas las `content_revisions` de esa página, cada una vinculada a su `ai_generation_id` origen si fue generada (NULL si editada manualmente)

### Requirement: Endpoint admin POST generar contenido SEO

El sistema SHALL exponer `POST /api/admin/ia/generar` protegido por sesión Auth.js y permiso atómico `ai.generate`. El cuerpo SHALL validarse con schema Zod estricto (`pageType`, `inputs`, `templateId` opcional, `model` opcional, `targetContentType`/`targetContentId` opcionales, `regenerateSection` opcional). Respuestas SHALL usar el envelope HTTP del proyecto (`apiSuccess` / `apiError`).

#### Scenario: Generación exitosa con permiso editor

- **WHEN** un usuario autenticado con rol `editor` envía `POST` con `pageType` válido, `inputs` que cumplen el `input_schema` de la plantilla activa y el presupuesto mensual no está superado
- **THEN** la respuesta es `201` con la salida estructurada validada y existe una fila `ai_generations` con `status='success'` más su fila `ai_token_usage` asociada

#### Scenario: Sin sesión

- **WHEN** se invoca sin cookie de sesión válida
- **THEN** la respuesta es `401` con envelope de error

#### Scenario: Rol sin permiso ai.generate

- **WHEN** un usuario `gestor` o `tecnico` autenticado invoca el endpoint
- **THEN** la respuesta es `403` con envelope de error

#### Scenario: Presupuesto superado

- **WHEN** `assertWithinBudget` detecta gasto por encima del límite configurado
- **THEN** la respuesta es `429` con código `BUDGET_EXCEEDED`, no se invoca Claude y no se crea fila `ai_generations`

#### Scenario: Inputs inválidos frente a plantilla

- **WHEN** `inputs` no cumplen el `input_schema` JSON de la plantilla activa
- **THEN** la respuesta es `400` con detalle de validación y no se invoca Claude

#### Scenario: Fallo no recuperable de Claude

- **WHEN** `runGeneration` devuelve `{ ok: false }` con error no transitorio
- **THEN** la respuesta es `502` y la fila `ai_generations` refleja `status='error'` con mensaje seguro (sin PII)

### Requirement: Validación post-hoc de salida estructurada

El sistema SHALL parsear el `text` devuelto por `runGeneration` como JSON y validarlo con `generationOutputSchema` (campos `h1`, `h2h3`, `body`, `metaTitle` ≤60, `metaDescription` ≤155, `schemaSuggestion` opcional, `internalLinks` opcional). Si la validación falla o `runGeneration` marcó `partial` por truncado, `ai_generations.status` SHALL ser `partial` y no SHALL tratarse la salida como contenido publicable.

#### Scenario: JSON de Claude no cumple schema

- **WHEN** Claude devuelve texto que no parsea o no cumple `generationOutputSchema`
- **THEN** `ai_generations` queda con `status='partial'`, `output_text` conservado y `output_structured` sin datos publicables; la API devuelve `201` con indicador de `partial` y mensaje legible

#### Scenario: Salida válida

- **WHEN** el JSON cumple el schema
- **THEN** `output_structured` persiste el objeto validado y `status='success'` salvo truncado previo de `runGeneration`

### Requirement: Secuencia de persistencia sin Claude en transacción

El sistema SHALL invocar `runGeneration` fuera de cualquier transacción Prisma. La transacción SHALL limitarse a actualizar `ai_generations` y llamar `persistTokenUsage` tras conocer el resultado.

#### Scenario: Orden budget → registro → Claude → tx

- **WHEN** se procesa una solicitud válida
- **THEN** el orden es: comprobar presupuesto, crear `ai_generations` inicial, `runGeneration`, validar salida, transacción de actualización + token usage

### Requirement: Regeneración de sección con linaje

El sistema SHALL aceptar `regenerateSection` con `parentGenerationId` y `section`, validar que el padre existe y no está borrado, marcar `is_section_regeneration=true` y `parent_generation_id`, y validar la salida contra el subconjunto de schema correspondiente a la sección.

#### Scenario: Padre inválido

- **WHEN** `parentGenerationId` no existe o está soft-deleted
- **THEN** la respuesta es `400` sin invocar Claude

### Requirement: Auditoría ai_generate por invocación

El sistema SHALL registrar `audit_logs` con acción `ai_generate` y metadata en whitelist (`generationId`, `pageType`, `model`, `promptTemplateId`) de forma best-effort (fallo de auditoría no revierte la generación).

#### Scenario: Auditoría tras éxito

- **WHEN** una generación termina con persistencia exitosa
- **THEN** se intenta `recordAudit` con las claves permitidas
