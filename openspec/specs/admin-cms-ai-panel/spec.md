# admin-cms-ai-panel Specification

## Purpose

Panel de generación asistida por IA integrado en el editor CMS (GTK-74): pestaña «Generar con IA», consumo de `POST /api/admin/ia/generar`, volcado al formulario del editor y regeneración por sección, con avisos de presupuesto y salida parcial.

## Requirements

### Requirement: AI generation tab in content editor

The CMS content editor SHALL expose a «Generar con IA» workspace tab when the portal session has permission `ai.generate` and the editorial content type maps to a `PromptPageType` supported by GTK-38.

#### Scenario: Editor with ai.generate sees tab

- **WHEN** an editor opens `/contenido/service/nuevo`
- **THEN** the tab «Generar con IA» is visible

#### Scenario: User without ai.generate

- **WHEN** the session lacks `ai.generate`
- **THEN** the AI tab is not rendered (server-side `canUseAi` false)

### Requirement: Generate and apply structured output

The panel SHALL call `POST /api/admin/ia/generar` with `pageType`, `model`, and template `inputs`. On success it SHALL show structured output and SHALL apply values to the editor form only when the user clicks «Usar esta generación».

#### Scenario: Partial generation

- **WHEN** the API returns `status: partial`
- **THEN** the UI shows `partialReason` and does not treat output as valid for apply

#### Scenario: Budget exceeded

- **WHEN** the API returns 429 `BUDGET_EXCEEDED`
- **THEN** `AiBudgetNotice` is shown and output is not applied

### Requirement: Section regeneration

The panel SHALL support `regenerateSection` with `parentGenerationId` and merge only the affected output keys and form fields.

#### Scenario: Regenerate body only

- **WHEN** the user regenerates section `body`
- **THEN** other form fields (e.g. service name) remain unchanged
