# public-lead-presupuesto-api Specification

## Purpose

Captación HTTP del formulario público de presupuesto (GTK-28): validación Zod, Turnstile, rate limit, persistencia CRM y email de confirmación. Base para endpoints hermanos GTK-29/30/31.

## Requirements

### Requirement: Endpoint POST /api/leads/presupuesto

El sistema SHALL exponer `POST /api/leads/presupuesto` como Route Handler público sin sesión, validando el cuerpo con `budgetLeadSchema` (Zod `.strict()`), verificando Cloudflare Turnstile en servidor y aplicando rate limiting (`RATE_LIMIT_PUBLIC_PER_MIN`, clave `leads-presupuesto:{ip}`).

#### Scenario: Alta exitosa con confirmación

- **WHEN** el cliente envía un payload válido, `gdprConsent=true`, token Turnstile válido y no excede el rate limit
- **THEN** el sistema responde `201` con `{ success: true, data: { referenceNumber } }`, persiste `contact` (dedupe), `lead` (`lead_type=presupuesto`, `channel=formulario`) y `project` en estado `is_initial` (`lead-nuevo`) en una única transacción, y dispara `sendLeadConfirmation` tras el commit sin bloquear el `201`

#### Scenario: Validación Zod rechazada

- **WHEN** el cuerpo no cumple `budgetLeadSchema` o incluye claves extra
- **THEN** responde `400` con envelope `ApiErrorEnvelope` (`code=VALIDATION_ERROR`) y no crea registros

#### Scenario: Turnstile inválido

- **WHEN** el token Turnstile falta o `siteverify` devuelve `success: false`
- **THEN** responde `403` con `code=TURNSTILE_INVALID` y no crea registros

#### Scenario: Rate limit excedido

- **WHEN** la IP supera `publicPerMin` en la ventana de 60 s
- **THEN** responde `429` con `code=RATE_LIMITED`, cabecera `Retry-After` y no crea registros

### Requirement: Resolución de catálogos por slug

El caso de uso SHALL resolver `servicio`, `provincia` y `tipoObra` opcional contra `services.slug`, `provinces.slug` y `work_typologies.slug`. Slugs inexistentes SHALL producir `400 VALIDATION_ERROR` sin error 500.

#### Scenario: Slug de servicio desconocido

- **WHEN** `servicio` no coincide con ningún `Service.slug` activo
- **THEN** la petición falla con `400 VALIDATION_ERROR` antes de abrir transacción de escritura

### Requirement: reference_number único con reintento

El sistema SHALL generar `reference_number` mediante `generateUniqueReferenceNumber` compartido en `lib/leads/reference.ts`, con prefijo configurable (presupuesto SHALL seguir usando `PRE-` y formato `PRE-YYYYMMDD-XXXX`; ubicación usa `UBI-`), y reintentar hasta 5 veces ante colisión de unicidad dentro de la transacción.

#### Scenario: Colisión resuelta

- **WHEN** el primer candidato ya existe en `leads.reference_number`
- **THEN** se genera otro candidato y la transacción continúa sin exponer el conflicto al cliente

#### Scenario: Presupuesto tras refactor DRY

- **WHEN** se crea un lead de presupuesto después del refactor GTK-29
- **THEN** el `reference_number` sigue el formato `PRE-YYYYMMDD-XXXX` y los tests existentes de GTK-28 permanecen válidos

### Requirement: Atribución y consentimiento

El sistema SHALL persistir `utm_*`, `ga_client_id`, `landing_url`, derivar `source` (`LeadSource`) con reglas puras en `lib/leads/attribution.ts` y exigir `gdpr_consent=true` (Zod `z.literal(true)`).

#### Scenario: Consentimiento ausente

- **WHEN** `gdprConsent` no es exactamente `true`
- **THEN** responde `400 VALIDATION_ERROR` sin escritura en BD

### Requirement: Sin PII en logs del handler

Los logs del flujo de captación SHALL incluir como máximo `referenceNumber` y códigos de resultado; SHALL NOT registrar email, teléfono ni nombre del formulario.

#### Scenario: Error de email post-commit

- **WHEN** `sendLeadConfirmation` devuelve `ok: false`
- **THEN** la respuesta HTTP sigue siendo `201` y el log no contiene el email del destinatario

### Requirement: Registro generate_lead tras alta de presupuesto

Tras persistir con éxito el lead de presupuesto (post-commit de la transacción CRM), el caso de uso SHALL invocar `recordConversionEvent` con `eventName=generate_lead`, `leadId` del lead creado y atributos de atribución disponibles (`serviceSlug`, `provinceSlug`, `leadType=presupuesto`, `source`, `value`/`estimatedValue` si aplica). La llamada SHALL ser best-effort: un fallo de telemetría SHALL NOT revertir ni alterar el `201` del endpoint.

#### Scenario: generate_lead registrado

- **WHEN** `createBudgetLead` completa la transacción contact+lead+project
- **THEN** se invoca `recordConversionEvent` con `eventName='generate_lead'` y el `leadId` creado

#### Scenario: Fallo de telemetría no rompe el alta

- **WHEN** `recordConversionEvent` devuelve `null` o rechaza internamente
- **THEN** el alta de lead sigue devolviendo éxito (`referenceNumber`) y no propaga el error al cliente
