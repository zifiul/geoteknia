# Proposal — gtk-77-cwv-lighthouse-ci

> US: [GTK-77 — Optimización de Core Web Vitals en plantillas principales (Lighthouse CI gate)](https://linear.app/geoteknia/issue/GTK-77/optimizacion-de-core-web-vitals-en-plantillas-principales-lighthouse)
> Labels Linear: `Feature`, `Frontend`.
> Diseño Stitch: comentario en Linear — proyecto [Geoteknia Web pública B2B](https://stitch.withgoogle.com/projects/9787207935189076711); pantallas en GTK-48 (home), GTK-49 (servicio), GTK-54/55 (blog). Fase 2 añadirá GTK-51/53 (geo/caso).

## Why

El SEO es el producto y los CWV condicionan ranking y conversión. Existía `lighthouserc.cjs` con una sola URL (home) y assertions en `warn`, sin pipeline de CI: el gate no bloqueaba PRs. Este change materializa RF-14/RNF-PERF para la **Fase 1** (home, servicio, blog) con Lighthouse CI bloqueante, presupuestos y auditoría de LCP sin reconfigurar piezas ya resueltas (GTK-43 `next/image`/`next/font`, GTK-46 GTM diferido).

## What Changes

- `lighthouserc.cjs` — URLs Fase 1, assertions `error`, métricas CWV y `budgetPath`.
- `budget.json` — presupuestos de JS/imagen por plantilla Fase 1.
- `.github/workflows/lighthouse.yml` — CI en PR: migrate, seed, build, `lhci autorun`.
- `lib/perf/lighthouse-phase1.cjs` — fuente única de URLs y umbrales (consumida por LHCI y tests).
- `package.json` — script `ci:lighthouse` / alias `lighthouse`.
- Tests Vitest (config LHCI) y E2E Playwright (LCP `priority`, regresión GTM diferido en plantillas pillar).
- Documentación en `docs/technical/frontend-standards.md` (gate real) y nota Fase 2.

## Capabilities

### New Capabilities

- `lighthouse-ci-gate`: gate de rendimiento/SEO/a11y en CI para plantillas públicas Fase 1.

### Modified Capabilities

- _(ninguna spec viva de producto; solo tooling y auditoría de plantillas existentes)_

## Impact

- **Código:** configuración CI, `lib/perf/*`, posibles ajustes menores en héroes/imágenes si la auditoría detecta gaps vs diseño Stitch (layout ya implementado en GTK-48/49/55).
- **API / contrato:** **fase 2 del harness omitida** (sin Route Handlers ni Server Actions nuevos).
- **Rendimiento:** gate bloqueante; objetivos LCP &lt; 2,5 s, CLS &lt; 0,1, performance ≥ 90.
- **Seguimiento:** Fase 2 (geo-landing + caso) cuando GTK-51/GTK-53 estén en producción — fuera de este change.

## Fuera de alcance

- Plantillas geo-landing y detalle de caso en el gate (Fase 2).
- Reconfigurar `next.config.ts` imágenes, `next/font` o GTM (solo verificar).
- Envío de Web Vitals a GA4.
- Auditoría WCAG formal (GTK-76).
