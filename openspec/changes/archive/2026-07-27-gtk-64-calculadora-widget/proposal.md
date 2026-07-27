# Proposal — gtk-64-calculadora-widget

> US: [GTK-64 — Calculadora de alcance (widget interactivo)](https://linear.app/geoteknia/issue/GTK-64/calculadora-de-alcance-de-estudio-geotecnico-widget-interactivo)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/calculadora` desktop `329e22699e98401490186015ce4a1d7b`, mobile `956ea54e098a4a13a3336f51aa8defba`.
> Backend `POST /api/calculadora` (GTK-33) ya cerrado.

## Why

Convertir tráfico informacional en leads P1 con una calculadora orientativa (sondeos, profundidad, ensayos CTE) sin precio y un CTA hacia `/presupuesto` pre-rellenado. Materializa RF-Q1, US-01 y deja `calculator_use` solo en servidor (GTK-33).

## What Changes

- Página RSC `/calculadora` con metadata directa, `BreadcrumbList` JSON-LD y hero alineado a Stitch.
- `CalculatorWidget` (Client) + `ResultPanel`: formulario, estados vacío/cargando/éxito/422/400/red, validación con `calculatorInputSchema`, consumo de `POST /api/calculadora`.
- Utilidad `buildPresupuestoHrefFromPrefill` — `servicio` solo desde contexto de página (`parseContactContextSlugs`), nunca desde `prefill.servicio` del API.
- `cta_click` hacia presupuesto vía `pushRawDataLayer` (sin mirror); **no** `trackConversionEvent` para `calculator_use`.
- Tests unitarios (validación + href) y E2E Playwright (feliz, 422, inválido, no duplicación de mirror).
- Lighthouse: incluir `/calculadora` en URLs de gate CWV (GTK-77).

## Decisiones de producto

- **Embebido en plantilla de servicio (GTK-49):** fuera de alcance; solo página dedicada `/calculadora`.
- **Schema `WebApplication`:** omitido; solo `BreadcrumbList`.

## Capabilities

### New Capabilities

- `public-calculadora-page`: página pública y widget de calculadora de alcance.

### Modified Capabilities

- (ninguna — el contrato API vive en `public-calculadora-api` sin cambios)

## Impact

- **Contrato:** sin cambios en Zod/API (fase 2 omitida).
- **SEO:** nueva URL indexable; CWV vigilados en LHCI.
- **QA:** E2E Playwright obligatorio (label `Frontend`).

## Fuera de alcance

- Embebido en plantillas de servicio; `WebApplication` JSON-LD; duplicar `calculator_use` en cliente; cambios en GTK-33.
