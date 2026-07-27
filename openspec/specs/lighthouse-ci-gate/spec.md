# lighthouse-ci-gate Specification

## Purpose

Gate de Lighthouse CI bloqueante en pull requests para plantillas públicas Fase 1 (GTK-77): Core Web Vitals, presupuestos de recursos y regresiones de rendimiento (LCP, GTM diferido).

## Requirements

### Requirement: Gate Lighthouse CI bloqueante en PR

El repositorio SHALL ejecutar Lighthouse CI en cada pull request contra las plantillas de Fase 1 y SHALL fallar el check si las assertions configuradas no se cumplen.

#### Scenario: Assertions en nivel error

- **GIVEN** `lighthouserc.cjs` con categorías performance, accessibility y seo
- **WHEN** una ejecución de `lhci autorun` obtiene puntuaciones por debajo del umbral
- **THEN** el proceso termina con código de salida distinto de cero

#### Scenario: Cobertura Fase 1

- **GIVEN** un build de producción con base de datos sembrada para contenido de demo
- **WHEN** Lighthouse CI recolecta URLs
- **THEN** incluye al menos home (`/`), una landing de servicio publicada, el índice de blog (`/blog`) y un artículo de blog publicado

### Requirement: Presupuestos de recursos por plantilla

El proyecto SHALL mantener `budget.json` referenciado desde Lighthouse CI con límites de peso de script e imagen por ruta de Fase 1.

#### Scenario: Presupuesto aplicado

- **GIVEN** `budget.json` con entradas por path
- **WHEN** Lighthouse CI ejecuta con `budgetPath` configurado
- **THEN** un exceso de presupuesto de recursos contribuye al fallo del gate (nivel error)

### Requirement: Imagen LCP optimizada en plantillas pillar

Las plantillas home, servicio y artículo de blog SHALL usar `next/image` con `priority` y `sizes` en el elemento LCP (hero), y lazy-load en imágenes bajo el pliegue.

#### Scenario: Hero con priority

- **GIVEN** una página home, servicio o artículo con imagen hero publicada
- **WHEN** el HTML inicial se sirve al navegador
- **THEN** la imagen hero incluye `fetchpriority="high"` (vía `priority` de `next/image`)

### Requirement: Terceros diferidos (regresión GTK-46)

Sin consentimiento de analítica, el contenedor GTM SHALL no realizar peticiones de red a `googletagmanager.com` en las plantillas públicas Fase 1.

#### Scenario: Sin consentimiento

- **GIVEN** un usuario sin consentimiento almacenado
- **WHEN** navega a `/`, una URL de servicio o `/blog`
- **THEN** no se observan peticiones a GTM antes de aceptar cookies
