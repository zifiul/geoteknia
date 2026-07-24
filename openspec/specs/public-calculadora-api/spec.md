# public-calculadora-api Specification

## Purpose

Estimación HTTP pública de alcance geotécnico orientativo (GTK-33): motor de reglas sobre `calculator_rules`, prefill hacia captación de presupuesto y telemetría `calculator_use`. Sin precio; consume catálogos y reglas seed (GTK-10/15/17) y `recordConversionEvent` (GTK-32).

## Requirements

### Requirement: Endpoint público POST /api/calculadora

El sistema SHALL exponer `POST /api/calculadora` como Route Handler público (sin autenticación) que, ante un cuerpo JSON válido con `tipoObra`, `plantas`, `superficie` y `provincia`, devuelve una estimación orientativa de alcance geotécnico **sin precio**.

#### Scenario: Estimación exitosa

- **WHEN** un cliente anónimo envía un POST con tipología y provincia existentes y parámetros dentro del rango de una regla activa
- **THEN** el sistema responde `200` con envelope `apiSuccess` y `data` que incluye `boreholes` (entero ≥ 1), `depthEstimate`, `recommendedTests`, `cteReference` y `prefill`
- **AND** el cuerpo de respuesta NO contiene campos de precio (`precio`, `price`, `cost`, `importe` o equivalentes)

#### Scenario: Prefill para CTA de presupuesto

- **WHEN** la estimación es exitosa (200) o no hay regla aplicable (422)
- **THEN** `data.prefill` incluye `servicio: null`, `provincia` (slug de entrada), `tipoObra` (slug de entrada), `plantas` y `superficie` numéricos del request

### Requirement: Validación Zod estricta de entrada

El sistema SHALL validar el cuerpo con `calculatorInputSchema` Zod `.strict()`: `tipoObra` y `provincia` string no vacío; `plantas` entero positivo ≤ 200; `superficie` número positivo ≤ 1_000_000. Slugs de tipología o provincia inexistentes (o soft-deleted) SHALL mapear a `400 VALIDATION_ERROR`.

#### Scenario: Payload inválido

- **WHEN** faltan campos, hay claves desconocidas, `plantas` ≤ 0 o `superficie` no positiva
- **THEN** el sistema responde `400` con `code: VALIDATION_ERROR` y no consulta reglas ni emite eventos

#### Scenario: Tipología o provincia inexistente

- **WHEN** `tipoObra` o `provincia` no resuelven a un registro activo del catálogo
- **THEN** el sistema responde `400 VALIDATION_ERROR` sin revelar detalles internos de BD

### Requirement: Motor de reglas puro y determinista

El cálculo SHALL ejecutarse en una función pura `estimate(input, rules)` sin acceso a Prisma ni efectos secundarios. La fórmula `linear` SHALL ser `base + (perFloor ?? 0) * plantas + per1000m2 * (superficie / 1000)`, redondeada con `Math.ceil` y mínimo `1`. El JSON de `boreholes_formula` SHALL validarse con schema Zod discriminado por `type` (sin `eval` ni `Function`).

#### Scenario: Misma entrada misma salida

- **WHEN** se invoca `estimate` dos veces con el mismo input y el mismo array de reglas
- **THEN** ambas invocaciones producen el mismo resultado (incluidos `noRule`)

#### Scenario: Redondeo de seguridad geotécnica

- **WHEN** la fórmula lineal produce un valor no entero (p. ej. 3.2)
- **THEN** `boreholes` es `Math.ceil` de ese valor y nunca inferior a `1`

#### Scenario: Fórmula corrupta en BD

- **WHEN** la regla seleccionada tiene un `boreholes_formula` que no valida el schema
- **THEN** el endpoint responde `500 INTERNAL_ERROR` controlado (sin NaN ni stack al cliente)

### Requirement: Selección de regla por tipología y rangos

El sistema SHALL cargar solo reglas con `work_typology_id` de la tipología resuelta, `is_active=true` y `deleted_at IS NULL`, normalizando `Decimal` de área a `number`. Encaje de rangos: `null` en min/max = extremo abierto. Si varias reglas encajan, el desempate SHALL ser determinista: rango de área más estrecho (∞ si open-ended), luego `createdAt` ascendente, luego `id` ascendente.

#### Scenario: Sin regla aplicable

- **WHEN** no existe ninguna regla activa cuyo rango de plantas/superficie contenga los inputs
- **THEN** el sistema responde `422` con `code: NO_APPLICABLE_RULE`, mensaje orientativo y `data.prefill` presente
- **AND** no incluye estimación de sondeos/profundidad/ensayos

#### Scenario: Tipología con floors null (obra-civil / portuaria)

- **WHEN** la tipología tiene regla con `minFloors`/`maxFloors` null y la superficie está en rango
- **THEN** el sistema aplica esa regla independientemente del valor de `plantas` (si `plantas` es válido en schema)

### Requirement: Provincia solo para prefill y atribución

La provincia SHALL resolverse por slug (existencia) pero NO SHALL alterar el cálculo de alcance. Su slug SHALL usarse en `prefill.provincia` y como `provinceSlug` del evento `calculator_use`.

#### Scenario: Misma tipología distinta provincia

- **WHEN** se calculan dos requests idénticos salvo `provincia` (ambas válidas)
- **THEN** `boreholes`, `depthEstimate`, `recommendedTests` y `cteReference` son idénticos
- **AND** solo difiere `prefill.provincia` (y el slug del evento)

### Requirement: Telemetría calculator_use best-effort

Tras una estimación 200 exitosa, el sistema SHALL llamar a `recordConversionEvent({ eventName: 'calculator_use', provinceSlug, serviceSlug: tipoObra, value: boreholes })` de forma best-effort (sin `leadId`). Un fallo de telemetría NO SHALL alterar el `200` ni el cuerpo de estimación. En `422` NO es obligatorio emitir el evento (no hay `value` de sondeos).

#### Scenario: Fallo de telemetría no bloquea

- **WHEN** `recordConversionEvent` falla o devuelve `null` tras un cálculo válido
- **THEN** el cliente recibe igualmente `200` con la estimación

### Requirement: Rate limiting sin Turnstile

El endpoint SHALL aplicar rate limiting por IP con clave `calculadora:{ip}` y límite `readRateLimitEnv().publicPerMin`. Superado el límite → `429 RATE_LIMITED` con `Retry-After`. El endpoint SHALL NOT exigir Turnstile.

#### Scenario: Rate limit excedido

- **WHEN** se supera el límite público por minuto para la IP
- **THEN** el sistema responde `429` con `code: RATE_LIMITED` y header `Retry-After`

#### Scenario: Sin Turnstile

- **WHEN** un POST válido llega sin token Turnstile
- **THEN** el sistema procesa la solicitud normalmente (no responde 403 por ausencia de captcha)
