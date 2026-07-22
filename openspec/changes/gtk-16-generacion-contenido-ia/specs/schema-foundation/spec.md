## MODIFIED Requirements

### Requirement: Enums de base de datos

El sistema SHALL define enums de base de datos para tipos y estados transversales. Para GTK-16, se añaden:

#### Enums

- `PromptPageType`: tipos de página para las que se generan prompts: `service`, `geo_zone`, `service_zone`, `case_study`, `blog`, `faq`, `meta`.
- `AiGenerationStatus`: estados posibles de una invocación a Claude: `success`, `error`, `partial`, `retrying`.
- `WorkflowStatus`: estados del flujo editorial de contenido: `borrador_ia`, `en_revision`, `aprobado`, `publicado`. (Preexistente; GTK-16 lo usa pero no lo modifica.)

#### Scenario: Usar PromptPageType en plantilla
- **WHEN** se crea `prompt_template` con `page_type='blog'`
- **THEN** Prisma valida que `page_type` es un valor válido de `PromptPageType` (compilación en TypeScript, validación en BD).

#### Scenario: Usar AiGenerationStatus en registro
- **WHEN** se registra `ai_generation` con `status='retrying'`
- **THEN** Prisma valida estado contra enum `AiGenerationStatus`.
