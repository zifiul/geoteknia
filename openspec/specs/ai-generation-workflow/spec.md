# ai-generation-workflow Specification

## Purpose

Subsistema de invocaciones a Claude con plantillas parametrizadas, registro de inputs/outputs, reintentos y linaje de regeneraciones. Materializa GTK-16 y soporta RF-19 (generación de contenido IA).

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
