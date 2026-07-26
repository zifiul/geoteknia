# public-budget-form-page Specification

Página pública `/presupuesto` con wizard de solicitud de presupuesto (GTK-66). Materializa RF-02 y conversión `generate_lead` en cliente.

## Requirements

### Requirement: Ruta pública /presupuesto con wizard de tres pasos

El sistema SHALL exponer `/presupuesto` como página pública indexable con un formulario en tres pasos: (1) servicio y provincia, (2) datos de proyecto opcionales, (3) contacto, consentimiento RGPD y Turnstile. El envío SHALL usar `POST /api/leads/presupuesto` y `budgetLeadSchema` como única fuente de validación compartida.

#### Scenario: Metadata y canonical
- **WHEN** se solicita `/presupuesto`
- **THEN** la respuesta incluye `title` y `description` de producto, `robots: index,follow` y canonical absoluta a `/presupuesto`

#### Scenario: Pre-relleno desde query
- **WHEN** el usuario abre `/presupuesto?servicio={slug}&provincia={slug}`
- **THEN** los campos de servicio y provincia del paso 1 aparecen pre-rellenados con esos slugs (tras sanitización)

#### Scenario: Pre-relleno calculadora en paso 2
- **WHEN** la URL incluye `tipoObra`, `plantas` y/o `superficie` válidos
- **THEN** el paso 2 muestra esos valores en los campos correspondientes

### Requirement: Indicador de progreso y validación por paso

El sistema SHALL mostrar `StepIndicator` con el paso actual (1–3), `aria-current` en el paso activo y región `aria-live` que anuncie el cambio de paso. No SHALL permitir avanzar si la validación Zod del paso actual falla.

#### Scenario: Bloqueo por email inválido en paso 3
- **WHEN** el usuario intenta enviar con email inválido
- **THEN** se muestra error accesible (`role="alert"`) y no se realiza el POST

### Requirement: Envío, thank-you y errores globales

Tras envío válido con Turnstile, el sistema SHALL redirigir a `/gracias/presupuesto?ref={referenceNumber}`. Los códigos `403 TURNSTILE_INVALID` y `429 RATE_LIMITED` SHALL mostrar mensaje global accesible, alineado con el patrón de `TenderForm.tsx`.

#### Scenario: Éxito 201
- **WHEN** el API responde `201` con `referenceNumber`
- **THEN** el navegador navega a thank-you con el parámetro `ref` codificado

### Requirement: Medición GA4 en cliente

El wizard SHALL emitir `form_start` y `form_step` vía `pushRawDataLayer` (sin mirror a `/api/eventos`) y `generate_lead` vía `trackConversionEvent` con `leadType=presupuesto` y slugs de servicio/provincia cuando el envío sea correcto.

#### Scenario: Avance de paso
- **WHEN** el usuario completa validación y avanza del paso 1 al 2
- **THEN** se emite `form_step` con `form_step: 2` y `form_name` identificando presupuesto
