# public-location-widget (delta)

## ADDED Requirements

### Requirement: Widget flotante de ubicación

El sitio público SHALL ofrecer un widget de microconversión que permita enviar referencia catastral o coordenadas junto con email o teléfono, validado con `locationLeadSchema` en cliente y servidor.

#### Scenario: Envío feliz con catastral

- **WHEN** el usuario completa referencia catastral, email, consentimiento RGPD y Turnstile y envía
- **THEN** el cliente llama `POST /api/leads/ubicacion` y, ante `201`, redirige a `/gracias/ubicacion?ref={referenceNumber}`

#### Scenario: Sin ubicación

- **WHEN** el usuario intenta enviar sin catastral ni coordenadas
- **THEN** la validación Zod falla y se muestra error accesible sin llamar al API

#### Scenario: Sin contacto

- **WHEN** el usuario indica ubicación pero ni email ni teléfono
- **THEN** la validación Zod falla con mensaje de contacto obligatorio

### Requirement: Accesibilidad del panel

El panel SHALL comportarse como diálogo modal (foco atrapado, cierre con Esc) reutilizando el componente `Dialog` del design system.

#### Scenario: Teclado

- **WHEN** el usuario abre el widget y pulsa Esc
- **THEN** el diálogo se cierra y el foco vuelve al disparador

### Requirement: Tracking de microconversión

Al abrir el formulario SHALL dispararse `form_start` en dataLayer (no canónico). Tras envío exitoso SHALL dispararse `send_location` vía `trackConversionEvent` con contexto de servicio/provincia cuando exista.

#### Scenario: Contexto de servicio

- **WHEN** el widget está montado en `/servicios/{slug}` y el envío tiene éxito
- **THEN** `send_location` incluye `serviceSlug` igual al slug del servicio

### Requirement: Geolocalización opcional (Opción A)

El widget SHALL ofrecer un control para rellenar lat/lng desde `navigator.geolocation` sin cargar Google Maps JS API.

#### Scenario: Usuario acepta geolocalización

- **WHEN** el usuario pulsa usar ubicación actual y el navegador devuelve coordenadas válidas
- **THEN** el payload incluye `mapLat` y `mapLng` dentro de rango permitido por el schema
