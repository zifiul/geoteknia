# Design — gtk-64-calculadora-widget

## Enfoque

- **Página:** RSC `app/(public)/calculadora/page.tsx` carga `listWorkTypologies()` + `listOperationalProvinces()`, parsea `searchParams` para pre-relleno y `parseContactContextSlugs` para `hostServiceSlug`. Metadata en `lib/calculator/page-config.ts` (patrón `/licitaciones`).
- **Widget:** `CalculatorWidget` gestiona estado local, validación Zod, `fetch POST /api/calculadora`, ramas 200/422/400/429/5xx. `ResultPanel` presenta tarjetas de alcance (Stitch: iconografía + métricas) y disclaimer legal.
- **Layout Stitch:** hero con eyebrow «Herramienta», H1 «Calculadora de alcance geotécnico», subtítulo sin precio; desktop dos columnas (formulario | resultado con min-height reservado); mobile apilado (screen `956ea54e…`).
- **CTA:** `buildPresupuestoHrefFromPrefill(prefill, { hostServiceSlug })` + `pushRawDataLayer({ event: 'cta_click', cta_name: 'calculator_presupuesto', ... })` en navegación.

## Threat model

### Superficie de ataque

- Formulario público (sin auth); respuestas JSON del API ya endurecido (GTK-33).
- Query params de pre-relleno (`provincia`, `tipoObra`, `servicio`).
- Enlaces generados hacia `/presupuesto`.

### Actores

- Anónimo, bot de abuso (rate limit en API, no en UI).

### Datos sensibles

- Sin PII en el widget; no loguear inputs en cliente.

### Amenazas identificadas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | XSS vía query prefill | Sanitizar longitud en selects (slugs de catálogo) |
| T2 | Open redirect en CTA | Solo path interno `/presupuesto` con `URLSearchParams` |
| T3 | Doble conteo `calculator_use` | Prohibido `trackConversionEvent` en widget |
| T4 | Fuga de precio | UI no renderiza campos de importe; tests E2E |
| T5 | Spam al API | Rate limit servidor; deshabilitar submit mientras `aria-busy` |

### Requisitos de seguridad (criterios de aceptación)

- [ ] SEC-1: CTA presupuesto solo genera URLs bajo `/presupuesto` con query codificada.
- [ ] SEC-2: `servicio` en query del CTA solo si `hostServiceSlug` definido en página.
- [ ] SEC-3: Sin `trackConversionEvent('calculator_use')` en bundle del widget.
- [ ] SEC-4: Errores API no insertan HTML crudo de mensajes en `dangerouslySetInnerHTML`.

## Decisiones

- Página dedicada; embebido GTK-49 diferido.
- Sin `WebApplication` JSON-LD.
- Reutilizar `Select`, `Input`, `Button`, tokens `brand-*` de DESIGN.md.

## Integración

- GTK-33 API, GTK-66 presupuesto (pre-relleno URL), GTK-47 `cta-query`, GTK-46 dataLayer.
