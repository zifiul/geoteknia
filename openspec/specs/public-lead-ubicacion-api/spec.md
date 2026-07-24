# public-lead-ubicacion-api Specification

## Purpose

Captación HTTP de la microconversión «enviar ubicación» (GTK-29): referencia catastral o pin de mapa más contacto mínimo (email o teléfono), validación Zod, Turnstile, rate limit, persistencia CRM, email condicional y evento `send_location`.

## Requirements

### Requirement: Endpoint POST /api/leads/ubicacion

El sistema SHALL exponer `POST /api/leads/ubicacion` como Route Handler público sin sesión, validando el cuerpo con `locationLeadSchema` (Zod `.strict()` + `superRefine`), verificando Cloudflare Turnstile en servidor y aplicando rate limiting (`RATE_LIMIT_PUBLIC_PER_MIN`, clave `leads-ubicacion:{ip}`).

#### Scenario: Alta exitosa con referencia catastral y email

- **WHEN** el cliente envía `cadastralRef`, email o teléfono (al menos uno), `gdprConsent=true`, token Turnstile válido y no excede el rate limit
- **THEN** el sistema responde `201` con `{ success: true, data: { referenceNumber } }` donde `referenceNumber` usa prefijo `UBI-`, persiste `contact` (dedupe), `lead` (`lead_type=ubicacion`, `channel=ubicacion`) y `project` en estado `is_initial` en una única transacción, envía email de confirmación solo si hay email, y registra `conversion_events` con tipo `send_location` best-effort tras el commit

#### Scenario: Alta con coordenadas de mapa sin email

- **WHEN** el cliente envía `mapLat` y `mapLng` válidos, solo `telefono`, sin email, y el resto de requisitos se cumple
- **THEN** responde `201`, crea lead y project, no invoca email de confirmación, y no falla la petición si el evento de conversión falla

#### Scenario: Sin ubicación

- **WHEN** faltan `cadastralRef` y el par `mapLat`/`mapLng`
- **THEN** responde `400` con `code=VALIDATION_ERROR` y no crea registros

#### Scenario: Sin canal de contacto

- **WHEN** faltan email y teléfono
- **THEN** responde `400` con `code=VALIDATION_ERROR` y no crea registros

#### Scenario: Latitud sin longitud

- **WHEN** solo uno de `mapLat` o `mapLng` está presente
- **THEN** responde `400` con `code=VALIDATION_ERROR` y no crea registros

#### Scenario: Turnstile inválido

- **WHEN** el token Turnstile falta o `siteverify` devuelve `success: false`
- **THEN** responde `403` con `code=TURNSTILE_INVALID` y no crea registros

#### Scenario: Rate limit excedido

- **WHEN** la IP supera `publicPerMin` en la ventana de 60 s
- **THEN** responde `429` con `code=RATE_LIMITED`, cabecera `Retry-After` y no crea registros

### Requirement: Validación de coordenadas y contacto mínimo

`locationLeadSchema` SHALL aceptar `nombre` opcional, email y teléfono opcionales individualmente pero exigir al menos uno de email o teléfono; SHALL validar `mapLat` ∈ [-90, 90] y `mapLng` ∈ [-180, 180]; SHALL NOT exigir `servicio` ni `rol`.

#### Scenario: Payload con claves extra

- **WHEN** el JSON incluye propiedades no declaradas en el schema
- **THEN** responde `400 VALIDATION_ERROR` (`.strict()`)

### Requirement: Provincia opcional por slug

Si el cliente envía `provincia` (slug), el caso de uso SHALL resolver `provinces.slug`; slug inexistente SHALL producir `400 VALIDATION_ERROR` sin error 500.

#### Scenario: Slug de provincia desconocido

- **WHEN** `provincia` no coincide con ningún `Province.slug`
- **THEN** la petición falla con `400 VALIDATION_ERROR` antes de escritura

### Requirement: Sin PII en logs del handler

Los logs del flujo de captación de ubicación SHALL incluir como máximo `referenceNumber` y códigos de resultado; SHALL NOT registrar email, teléfono, referencia catastral ni coordenadas en claro.

#### Scenario: Error interno tras validación

- **WHEN** ocurre un error no esperado en el caso de uso
- **THEN** el cliente recibe `500 INTERNAL_ERROR` sin detalles de PII y los logs no contienen datos de contacto
