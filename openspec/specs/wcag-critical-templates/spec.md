# wcag-critical-templates

Especificación viva promovida desde `gtk-76-wcag-critical-templates`.

## Requirements

### Requirement: Axe WCAG 2.1 AA en plantillas críticas

El sistema SHALL ejecutar `@axe-core/playwright` con tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` sobre cada una de las nueve rutas críticas (home, servicio, geo-landing publicada, caso publicado, artículo de blog, presupuesto, calculadora, contacto, login admin) y SHALL fallar si existe alguna violación con impacto `critical` o `serious`.

#### Scenario: Home sin violaciones críticas

- **WHEN** se carga `/` tras aceptar o rechazar cookies de forma determinista en el test
- **THEN** axe no reporta violaciones critical/serious

#### Scenario: Login admin anónimo

- **WHEN** se carga `/admin/login` sin sesión
- **THEN** axe no reporta violaciones critical/serious

### Requirement: Lighthouse accesibilidad Fase 2

`LIGHTHOUSE_PHASE1_RELATIVE_PATHS` SHALL incluir las nueve rutas alineadas con seed/E2E y `pnpm run ci:lighthouse` SHALL mantener `categories:accessibility` ≥ 0.95 en todas ellas.

#### Scenario: Gate LHCI en PR

- **WHEN** el workflow Lighthouse CI recorre las URLs de Fase 2
- **THEN** la categoría accessibility cumple el umbral configurado en `lighthouseAssertConfig`

### Requirement: CI Playwright a11y

Un workflow de `.github/workflows/` SHALL ejecutar `pnpm run test:e2e` (o el subconjunto de specs con axe) en pull requests como gate bloqueante.

#### Scenario: PR con regresión de contraste

- **WHEN** un cambio introduce una violación axe serious en `/contacto`
- **THEN** el job de E2E falla

### Requirement: Teclado y foco en flujos críticos

Los formularios multipaso (presupuesto), menú móvil y diálogos SHALL ser operables por teclado, con foco visible y restauración de foco al cerrar overlays; el primer campo con error SHALL recibir foco tras validación fallida en presupuesto.

#### Scenario: Presupuesto — foco en primer error

- **WHEN** el usuario intenta avanzar sin completar campos obligatorios del paso 1
- **THEN** el foco se mueve al primer control inválido y el mensaje se anuncia (`role="alert"` o `aria-live`)
