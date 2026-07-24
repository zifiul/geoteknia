# Proposal — gtk-36-integracion-claude-server-side

> US: [GTK-36 — Integración Claude server-side](https://linear.app/geoteknia/issue/GTK-36/integracion-claude-server-side-cliente-retries-prompt-caching-token)
> Labels: `Backend`, `Feature` | Dependencias: GTK-21 (bootstrap ✅), GTK-16 (modelos IA ✅), GTK-37 (presupuesto ✅) | Consumido por: [GTK-38](https://linear.app/geoteknia/issue/GTK-38)

## Why

Sin un cliente Claude server-only con retries, timeout, prompt caching, cálculo de coste y ledger `ai_token_usage`, GTK-38 no puede generar contenido SEO de forma fiable ni alimentar el control de presupuesto de GTK-37. Materializa RF-19 y RNF-IA (clave server-side, modelos, caché, backoff, registro de tokens).

## What Changes

- **Dominio:** `lib/ia/client.ts`, `models.ts`, `generate.ts` (`runGeneration`), `token-usage.ts` (`computeCostEur`, `persistTokenUsage`), `errors.ts` (`AiGenerationError`).
- **Env:** `IA_DEFAULT_MODEL`, `IA_MAX_RETRIES`, `IA_TIMEOUT_MS`, `IA_USD_TO_EUR_RATE`.
- **Tests:** Vitest con SDK mockeado + integración BD para `persistTokenUsage`; abuse cases de secretos/PII en logs.
- **Docs:** `backend-standards.md` §9.1–9.2 (contrato Claude + tarifas).
- **QA:** Vitest + verificación BD; **sin** curl N+2 (sin Route Handlers); **sin** E2E N+3 (label `Backend`).

## Capabilities

### New Capabilities

- `ai-claude-integration`: invocación robusta a Claude, prompt caching, coste EUR y persistencia de uso.

### Modified Capabilities

- (ninguna spec viva obligatoria; extiende ledger GTK-16 y presupuesto GTK-37)

## Impact

- **Código:** `lib/ia/*`, `lib/env.ts`, `tests/unit/ia/**`, `tests/qa/gtk-36-db.qa.test.ts`.
- **BD:** solo escritura en `ai_token_usage` (sin migración).
- **API:** **ninguna** — fase 2 (contrato HTTP) omitida; GTK-38 añadirá endpoint.
- **Seguridad:** `ANTHROPIC_API_KEY` solo en `client.ts`; sin PII en prompts/logs.

## Fuera de alcance

- Endpoint `/api/...` y fila `ai_generations` (GTK-38).
- Migración de enum a `claude-sonnet-5` (documentado en `design.md`).
- E2E Playwright (label `Backend`).
