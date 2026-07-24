# Design — gtk-36-integracion-claude-server-side

> US: [GTK-36](https://linear.app/geoteknia/issue/GTK-36)

## Decisiones (hallazgos Linear)

| # | Tema | Decisión |
|---|------|----------|
| 1 | Retries | `maxRetries` del SDK desde `IA_MAX_RETRIES`; sin bucle manual. |
| 2 | Timeout | `timeout` del SDK en ms desde `IA_TIMEOUT_MS`. |
| 3 | Sampling | No enviar `temperature`/`top_p`/`top_k` a Opus 4.8 / 4.6+. |
| 4 | Model IDs | Mantener enum Prisma `AiModel`; migración a Sonnet 5 fuera de alcance. |
| 5 | Usage | `input_tokens` = remanente no cacheado; tarificar buckets por separado. |
| 6 | Coste | Tabla tarifas USD/M + FX `IA_USD_TO_EUR_RATE` (default 0.92 MVP). |
| 7 | Caché | Prefijo `system` con `cache_control`; mínimos 2048 (Sonnet) / 4096 (Opus) tokens — no cachea en silencio por debajo. |
| 8 | Streaming | Umbral `16384` `max_tokens` → `messages.stream().finalMessage()`. |
| 9 | Orden FK | GTK-38 crea `ai_generations`; GTK-36 expone `runGeneration` + `persistTokenUsage`. |
| 10 | Periodo | `currentBillingPeriodUtc()` de `budget.ts`. |

## Arquitectura

```
GTK-38 (futuro)
  → assertWithinBudget()
  → runGeneration()     → anthropic (client.ts)
  → persistTokenUsage()   → ai_token_usage
```

Tarifas USD por 1M tokens (referencia Anthropic, jul 2026):

| Modelo | Input | Output | Cache read (0.1× input) | Cache write (1.25× input) |
|--------|-------|--------|-------------------------|---------------------------|
| Sonnet 4.6 | 3 | 15 | 0.3 | 3.75 |
| Opus 4.8 | 5 | 25 | 0.5 | 6.25 |

## Threat model

### Superficie de ataque

- Módulos `lib/ia/*` (sin HTTP directo).
- Variables `ANTHROPIC_API_KEY` y prompts construidos desde parámetros SEO.

### Actores

- Cliente web: no accede al SDK ni a la clave.
- Usuario autenticado GTK-38: indirecto vía endpoint futuro.
- Atacante con código cliente: no puede extraer la clave si el build respeta `server-only`.

### Datos sensibles

- Clave API Anthropic (secreto).
- Prompts: solo parámetros SEO aprobados; prohibido PII de CRM.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Fuga de API key | import en Client Component | Coste / abuso | `server-only` solo en `client.ts`; grep en CI |
| T2 | PII en prompt | inyección desde CRM | RGPD | GTK-38 valida inputs; tests sin PII en payload mock |
| T3 | PII en logs | log del prompt completo | RGPD | Log estructurado: modelo, tokens, coste, latencia — sin texto de prompt |
| T4 | Prompt injection en SEO params | strings maliciosos en keyword | Calidad / fuga | Validación Zod en GTK-38; no ejecutar HTML en servidor |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: `ANTHROPIC_API_KEY` referenciada solo en `lib/ia/client.ts`.
- [ ] SEC-2: Logs de generación no contienen `userMessage` ni prefijo completo.
- [ ] SEC-3: Tests verifican que el mock del SDK no recibe campos de email/teléfono de lead.

### Amenazas descartadas

- **RBAC en este ticket:** GTK-38 aplica `ai.generate`.
- **Rate limit HTTP:** sin endpoint nuevo.
- **Turnstile:** N/A (interno).

## Contrato GTK-38

1. Crear `ai_generations` con `requestedById`, `status`.
2. `assertWithinBudget()`.
3. `runGeneration({ model, userMessage, cacheablePrefix, maxTokens })`.
4. `persistTokenUsage(aiGenerationId, usage, model)` incluso si `status === partial`.
