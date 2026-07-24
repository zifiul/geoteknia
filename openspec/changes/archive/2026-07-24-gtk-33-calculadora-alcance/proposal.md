# Proposal — gtk-33-calculadora-alcance

> US: [GTK-33 — POST /api/calculadora: calculadora de alcance de estudio geotécnico](https://linear.app/geoteknia/issue/GTK-33/post-apicalculadora-calculadora-de-alcance-de-estudio-geotecnico)
> Dependencias: GTK-32 (`recordConversionEvent` ✅), GTK-15 (`calculator_rules` ✅), GTK-10 (provincias/tipologías ✅), GTK-17 (seed reglas ✅); GTK-26 (rate limiting ✅)
> Desbloquea: GTK-64 (widget frontend de calculadora)
> Ticket enriquecido: `docs/GTK-33-calculadora-alcance-geotecnico.md` (tras Gate 1 / stash)

## Why

El tráfico informacional de la web no se convierte si el visitante no puede hacerse una idea tangible del alcance de un estudio geotécnico. RF-Q1 / US-01 exigen una estimación **orientativa y sin precio** (sondeos, profundidad, ensayos CTE) basada en `calculator_rules`, más un prefill hacia el formulario de presupuesto (GTK-28). La tabla y el seed ya existen; falta el endpoint público y el motor de reglas puro.

## What Changes

- Nuevo módulo `lib/calculator/*`: schemas Zod (entrada, fórmula discriminada `linear`, salida + prefill), motor puro `estimate`/`selectRule`, repositorio de reglas activas (Decimal→number).
- Nuevo `POST /api/calculadora` (`app/api/calculadora/route.ts`): público, rate limit, sin Turnstile, sin persistir el cálculo; emite `calculator_use` best-effort.
- Contrato en `docs/technical/api-spec.yml` (200 con alcance+prefill; 400/422/429/500; NUNCA precio).
- Actualizar `backend-standards.md` §5.1: ruta canónica `POST /api/calculadora` (no `/api/calculator/alcance`).
- Tests unitarios + handler; QA con `curl` y verificación BD; **sin E2E Playwright** (label `Backend` — harness).

## Capabilities

### New Capabilities

- `public-calculadora-api`: estimación de alcance geotécnico vía HTTP + motor de reglas puro sobre `calculator_rules`, prefill CTA y telemetría `calculator_use`.

### Modified Capabilities

- *(ninguna)* — `conversion-events`, `faqs-lead-magnets-calculator-rules` y maestros ya cubren persistencia/seed; este change solo consume esas capacidades.

## Impact

- **Código:** `lib/calculator/*` (nuevo), `app/api/calculadora/route.ts`, `docs/technical/api-spec.yml`, `docs/technical/backend-standards.md` (§5.1).
- **BD:** lectura de `calculator_rules` / catálogos; escritura solo append-only `conversion_events` (`calculator_use`); sin migración.
- **API:** nuevo endpoint público; rate limit; sin Turnstile (documentado).
- **SEO:** sin impacto directo (API JSON); el widget UI es GTK-64.
- **RGPD / seguridad:** sin PII (solo tipología/plantas/superficie/provincia slug); sin Claude; sin audit_log; sin `eval`/`Function` en fórmulas.

## Fuera de alcance

- UI / widget de calculadora (GTK-64).
- Mapeo tipología→`servicio` en el formulario de presupuesto (costura frontend; `prefill.servicio` queda `null`).
- Persistencia de cada cálculo individual (solo evento de conversión).
- Turnstile en este endpoint (consulta idempotente sin creación de lead).
- E2E Playwright en este ticket (label `Backend`; flujo navegador en GTK-64).
- Nuevos tipos de fórmula más allá de `linear` (schema extensible, implementación solo `linear`).
