# public-lead-licitacion-api Specification

## Purpose

Captación HTTP del formulario de licitaciones/obra pública (GTK-31): contacto corporativo más referencia de expediente o enlace a plataforma de contratación, validación Zod, Turnstile, rate limit, persistencia CRM con priorización por importe, email con fallbacks y evento `generate_lead` con `leadType=licitacion`.

## Requirements

### Requirement: Endpoint POST /api/leads/licitacion

El sistema SHALL exponer `POST /api/leads/licitacion` como Route Handler público sin sesión, validando el cuerpo con `tenderLeadSchema` (Zod `.strict()` + `superRefine`), verificando Cloudflare Turnstile en servidor y aplicando rate limiting (`RATE_LIMIT_PUBLIC_PER_MIN`, clave `leads-licitacion:{ip}`).

#### Scenario: Alta exitosa con expediente y contacto corporativo

- **WHEN** el cliente envía contacto corporativo válido (`nombre`, `empresa`, `email`), `expedienteRef`, `gdprConsent=true`, token Turnstile válido y no excede el rate limit
- **THEN** el sistema responde `201` con `{ success: true, data: { referenceNumber } }` donde `referenceNumber` usa prefijo `LIC-`, persiste `contact`, `lead` (`lead_type=licitacion`, `channel=formulario`, `expediente_ref`, `estimated_value` si aplica) y `project` con los mismos campos de expediente/importe en una única transacción, envía email de confirmación con fallbacks de servicio/provincia, y registra `conversion_events` con `generate_lead` y `leadType=licitacion` best-effort tras el commit

#### Scenario: Alta con plataformaUrl sin expedienteRef

- **WHEN** el cliente envía `plataformaUrl` válida (sin `expedienteRef`) y el resto de requisitos se cumple
- **THEN** responde `201`, persiste `organismo`/`plataformaUrl`/`esUte` en `leads.project_data` cuando se aportan

#### Scenario: Sin expediente ni plataforma

- **WHEN** faltan `expedienteRef` y `plataformaUrl`
- **THEN** responde `400` con `code=VALIDATION_ERROR` y no crea registros

#### Scenario: Sin consentimiento RGPD

- **WHEN** `gdprConsent` no es exactamente `true`
- **THEN** responde `400` con `code=VALIDATION_ERROR` y no crea registros

#### Scenario: Turnstile inválido

- **WHEN** el token Turnstile falta o `siteverify` devuelve `success: false`
- **THEN** responde `403` con `code=TURNSTILE_INVALID` y no crea registros

#### Scenario: Rate limit excedido

- **WHEN** la IP supera `publicPerMin` en la ventana de 60 s
- **THEN** responde `429` con `code=RATE_LIMITED`, cabecera `Retry-After` y no crea registros

### Requirement: Validación de contacto corporativo

`tenderLeadSchema` SHALL exigir `nombre`, `empresa` y `email`; SHALL NOT exigir `rol` ni `servicio`; SHALL rechazar propiedades extra (`.strict()`).

#### Scenario: Payload con claves extra

- **WHEN** el JSON incluye propiedades no declaradas en el schema
- **THEN** responde `400 VALIDATION_ERROR`

### Requirement: Provincia opcional por slug

Si el cliente envía `provincia` (slug), el caso de uso SHALL resolver `provinces.slug`; slug inexistente SHALL producir `400 VALIDATION_ERROR` sin error 500.

#### Scenario: Slug de provincia desconocido

- **WHEN** `provincia` no coincide con ningún `Province.slug`
- **THEN** la petición falla con `400 VALIDATION_ERROR` antes de escritura

### Requirement: Sin PII en logs del handler

Los logs del flujo de captación de licitación SHALL incluir como máximo `referenceNumber` y códigos de resultado; SHALL NOT registrar email, teléfono, expediente ni URLs de plataforma en claro.

#### Scenario: Error interno tras validación

- **WHEN** ocurre un error no esperado en el caso de uso
- **THEN** el cliente recibe `500 INTERNAL_ERROR` sin detalles de PII y los logs no contienen datos de contacto
