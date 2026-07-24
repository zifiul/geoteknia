## ADDED Requirements

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
- **THEN** `ai_generations` queda con `status='partial'`, `output_text` conservado y `output_structured` sin datos publicables; la API devuelve `201` o `200` según contrato con indicador de `partial` y mensaje legible

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
