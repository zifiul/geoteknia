# schema-foundation Specification

## Purpose

Extensión de enums transversales del schema Prisma para el subsistema de generación IA (GTK-16). Complementa `prisma-schema-foundation`.

## Requirements

### Requirement: Enums de generación IA

El schema SHALL declarar los enums `PromptPageType` y `AiGenerationStatus` para el subsistema de generación IA y versionado editorial.

Valores de `PromptPageType`: `service`, `geo_zone`, `service_zone`, `case_study`, `blog`, `faq`, `meta`.

Valores de `AiGenerationStatus`: `success`, `error`, `partial`, `retrying`.

#### Scenario: Usar PromptPageType en plantilla

- **WHEN** se crea `prompt_template` con `page_type='blog'`
- **THEN** Prisma valida que `page_type` es un valor válido de `PromptPageType` (compilación en TypeScript, validación en BD)

#### Scenario: Usar AiGenerationStatus en registro

- **WHEN** se registra `ai_generation` con `status='retrying'`
- **THEN** Prisma valida estado contra enum `AiGenerationStatus`
