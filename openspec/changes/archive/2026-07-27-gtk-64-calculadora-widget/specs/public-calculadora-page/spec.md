# Delta spec — public-calculadora-page

## ADDED Requirements

### Requirement: Ruta pública /calculadora con widget

El sistema SHALL exponer `/calculadora` como página pública indexable con un Client Component que envía `tipoObra`, `plantas`, `superficie` y `provincia` a `POST /api/calculadora` y muestra el alcance estimado **sin precio**.

#### Scenario: Metadata y canonical

- **WHEN** se solicita `/calculadora`
- **THEN** la respuesta incluye `title` y `description` orientados a sondeos/alcance, `robots: index,follow`, canonical absoluta y `BreadcrumbList` JSON-LD

#### Scenario: Éxito 200

- **WHEN** el API responde `200` con estimación
- **THEN** la UI muestra `boreholes`, `depthEstimate`, `recommendedTests` y `cteReference` en una región `aria-live` y un CTA «Solicitar presupuesto exacto»

#### Scenario: Sin regla 422

- **WHEN** el API responde `422` con código `NO_APPLICABLE_RULE` y `data.prefill`
- **THEN** se muestra mensaje orientativo y CTA de presupuesto usando ese `prefill`

### Requirement: Validación cliente y pre-relleno URL

El sistema SHALL validar el formulario con `calculatorInputSchema` antes del POST. Los query params `provincia` y/o `tipoObra` SHALL inicializar selects cuando llegan desde geo-landing o servicio.

#### Scenario: Bloqueo de envío inválido

- **WHEN** faltan selects o los números no son positivos
- **THEN** no se envía el POST y se muestran errores de campo accesibles

### Requirement: CTA presupuesto y contexto servicio

El CTA SHALL navegar a `/presupuesto` con `provincia`, `tipoObra`, `plantas` y `superficie` del `prefill` de la respuesta. El parámetro `servicio` SHALL añadirse solo si existe en el contexto de la página anfitriona, nunca desde `prefill.servicio` del backend.

#### Scenario: Servicio solo desde contexto

- **WHEN** el usuario calcula con éxito y la URL incluye `?servicio=sondeos`
- **THEN** el href del CTA incluye `servicio=sondeos` además de los campos del prefill de calculadora

### Requirement: Medición sin doble calculator_use

El widget SHALL NOT llamar a `trackConversionEvent` con `calculator_use`. El clic en CTA presupuesto MAY emitir `cta_click` vía `pushRawDataLayer` sin mirror a `/api/eventos`.

#### Scenario: Sin mirror calculator_use

- **WHEN** el usuario completa un cálculo válido en el navegador
- **THEN** no se realiza `POST /api/eventos` con `eventName` `calculator_use` desde el cliente

### Requirement: Accesibilidad y responsive

El formulario SHALL usar labels asociadas, `aria-busy` durante el cálculo, foco al resultado tras éxito y layout mobile-first con resultado apilado bajo el formulario.

#### Scenario: Estado de carga

- **WHEN** el usuario envía el formulario válido
- **THEN** el formulario expone `aria-busy="true"` hasta recibir respuesta del API
