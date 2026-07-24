## ADDED Requirements

### Requirement: Cliente Anthropic server-only

El sistema SHALL instanciar `@anthropic-ai/sdk` únicamente en `lib/ia/client.ts` con `import 'server-only'`, configurando `maxRetries` y `timeout` desde variables de entorno validadas con Zod.

#### Scenario: Clave no expuesta al cliente
- **WHEN** se analiza el bundle de código cliente
- **THEN** no existe referencia a `ANTHROPIC_API_KEY` fuera de módulos server-only.

### Requirement: runGeneration con modelos y sin sampling prohibido

El sistema SHALL exponer `runGeneration` que invoca Claude con `claude-sonnet-4-6` por defecto (configurable vía `IA_DEFAULT_MODEL`) y permite `claude-opus-4-8` para piezas pillar vía `selectModel`. No SHALL enviar `temperature`, `top_p` ni `top_k` a modelos Opus 4.8 / familia 4.6+.

#### Scenario: Éxito con usage normalizado
- **WHEN** la API responde con `usage` incluyendo buckets de caché
- **THEN** el resultado incluye `inputTokens`, `outputTokens`, `cacheReadTokens` y `cacheWriteTokens` mapeados desde la respuesta del SDK.

#### Scenario: Error transitorio tras reintentos del SDK
- **WHEN** la API devuelve 429 o 5xx y el SDK agota `maxRetries`
- **THEN** `runGeneration` devuelve `{ ok: false, status: 'error' }` con `AiGenerationError` sin lanzar al caller.

### Requirement: Prompt caching del prefijo estático

El sistema SHALL enviar `cacheable_prefix` como bloque `system` con `cache_control: { type: 'ephemeral' }` antes del contenido volátil.

#### Scenario: Prefijo cacheable presente
- **WHEN** se invoca con `cacheablePrefix` no vacío
- **THEN** la petición al SDK incluye `cache_control` en el bloque del prefijo.

### Requirement: Streaming en salidas grandes

El sistema SHALL usar `messages.stream` + `finalMessage()` cuando `max_tokens` supere el umbral documentado (~16K).

#### Scenario: max_tokens alto
- **WHEN** `maxTokens` es mayor que el umbral de streaming
- **THEN** se usa la API de streaming y se extrae `usage` del mensaje final.

### Requirement: Cálculo y persistencia de coste (única fuente)

El sistema SHALL calcular `cost_eur` en `computeCostEur` con tarifas por modelo (input, output, multiplicadores de caché) y factor USD→EUR configurable, y persistir en `ai_token_usage` vía `persistTokenUsage` con `billing_period` de `currentBillingPeriodUtc()`.

#### Scenario: Ledger 1:1 con generación
- **WHEN** GTK-38 llama `persistTokenUsage` tras crear `ai_generations`
- **THEN** existe exactamente una fila `ai_token_usage` con FK única y columnas de tokens y coste coherentes con `getCurrentSpend` de GTK-37.
