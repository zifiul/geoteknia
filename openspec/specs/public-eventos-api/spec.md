# public-eventos-api Specification

## Purpose

Ingesta HTTP y helper de dominio para `conversion_events` (GTK-32): doble consumidor beacon/GTM + llamadores internos. Materializa RF-10 / RNF-DATA en runtime sobre el schema de GTK-14.

## Requirements

### Requirement: Endpoint POST /api/eventos

El sistema SHALL exponer `POST /api/eventos` como Route Handler público sin sesión ni Turnstile, aceptando un evento suelto o un lote `{ events: [...] }` (1–50), validando con Zod `.strict()` derivado de los enums Prisma (`ConversionEventName`, `LeadType`, `LeadSource`), aplicando rate limiting con clave `eventos:{ip}` que cuenta **eventos** (no requests) y respondiendo `202` con `{ success: true, data: { recorded: N } }`.

#### Scenario: Evento simple aceptado

- **WHEN** el cliente envía un JSON válido con `eventName` del enum y no excede el rate limit
- **THEN** el sistema responde `202`, inserta exactamente una fila en `conversion_events` con `occurred_at` fijado por el servidor y `recorded=1`

#### Scenario: Lote aceptado

- **WHEN** el cliente envía `{ events: [e1, e2, ...] }` con 2–50 eventos válidos
- **THEN** responde `202` con `recorded` igual al número de filas insertadas

#### Scenario: Validación Zod rechazada

- **WHEN** `eventName` está fuera del enum, hay claves desconocidas, el lote supera 50 o los tipos son inválidos
- **THEN** responde `400` con `ApiErrorEnvelope` (`code=VALIDATION_ERROR`) y no inserta filas

#### Scenario: Rate limit por eventos

- **WHEN** la IP acumula más de `publicPerMin` eventos en la ventana de 60 s (un lote de N consume N)
- **THEN** responde `429` con `code=RATE_LIMITED`, cabecera `Retry-After` y no inserta filas

#### Scenario: Parseo tolerante a beacon

- **WHEN** el cuerpo es JSON válido con `Content-Type: text/plain` (sendBeacon)
- **THEN** el handler parsea el cuerpo y procesa el evento como si fuera `application/json`

### Requirement: Persistencia append-only sin PII

La escritura en `conversion_events` SHALL usar solo `create`/`createMany` (nunca `update`/`delete`). `page_url` SHALL persistirse como `origin + pathname` (sin querystring ni fragment). Claves arbitrarias fuera del schema SHALL rechazarse. `occurred_at` SHALL NOT aceptarse del cliente.

#### Scenario: page_url sin querystring

- **WHEN** llega `pageUrl` con querystring (p. ej. `https://ejemplo.com/ruta?email=a@b.com`)
- **THEN** la fila persistida tiene `page_url` igual a `https://ejemplo.com/ruta`

#### Scenario: Append-only en el helper

- **WHEN** se inspecciona `lib/analytics/record-event.ts`
- **THEN** solo aparecen operaciones `create`/`createMany` sobre `conversionEvent`

### Requirement: lead_id degradado (anti-enumeración)

Si `leadId` no existe en `leads`, el sistema SHALL degradarlo a `null` e insertar el evento igualmente, sin responder `400` ni revelar si el UUID existía.

#### Scenario: lead_id inexistente

- **WHEN** el payload incluye un `leadId` UUID bien formado que no existe
- **THEN** responde `202` (vía HTTP) o el helper devuelve el id insertado, con `lead_id=null` en BD

### Requirement: Helper recordConversionEvent best-effort

El sistema SHALL exponer `recordConversionEvent` / `recordConversionEvents` en `lib/analytics` reutilizables server-side, siempre best-effort (fallo de persistencia → `null` / cuenta parcial, sin lanzar al llamador interno), con `options.tx?` opcional para participar en una transacción Prisma.

#### Scenario: Fallo de BD no propaga

- **WHEN** `db.conversionEvent.create` lanza un error inesperado
- **THEN** `recordConversionEvent` devuelve `null` y no lanza

#### Scenario: Lote vía createMany

- **WHEN** se llama `recordConversionEvents` con N inputs válidos
- **THEN** inserta N filas (o menos si hay degradación de FK) y devuelve el número insertado
