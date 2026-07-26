# Propuesta — gtk-66-formulario-presupuesto

> Ticket: [GTK-66](https://linear.app/geoteknia/issue/GTK-66/formulario-multi-paso-de-presupuesto-pre-relleno-por-url-validacion-en) | Rama: `feature/frontend-gtk-66-formulario-presupuesto`

## Why

`/presupuesto` es el principal punto de conversión del producto (RF-02, US-03) y hoy no existe como página pública, aunque CTAs de servicio ya enlazan `?servicio={slug}`. Sin el wizard multi-paso no se materializa `generate_lead` en cliente ni el recorrido P1 completo.

## What Changes

- Nueva ruta pública `/presupuesto` (RSC + wizard cliente en 3 pasos).
- Componente de design system `StepIndicator` (primer formulario multipaso).
- Módulo `lib/forms/*` para estado del wizard, validación parcial con `budgetLeadSchema` y payload de envío (patrón `TenderForm.tsx`).
- Envío a `POST /api/leads/presupuesto` (contrato GTK-28 ya congelado), redirección a `/gracias/presupuesto?ref=`.
- Tracking: `form_start` / `form_step` (datalayer raw) y `generate_lead` (canónico).
- UI alineada con diseños Stitch del comentario en Linear (pasos 1–3 desktop/mobile + estados de formulario).
- Tests unitarios (wizard, `StepIndicator`, payload) y E2E Playwright.

## Capabilities

### New Capabilities

- `public-budget-form-page`: página y wizard de solicitud de presupuesto, pre-relleno URL, accesibilidad y metadata SEO.

### Modified Capabilities

- (ninguna — el endpoint y `budgetLeadSchema` no cambian requisitos de spec viva)

## Impact

- **Frontend:** `app/(public)/presupuesto/`, `components/organisms/forms/budget-form/`, `components/molecules/StepIndicator.tsx`, `lib/forms/`, `lib/budget/page-config.ts`.
- **API:** solo consumo de `POST /api/leads/presupuesto` (sin cambios de contrato).
- **SEO:** `index,follow`, canonical `/presupuesto`, sin JSON-LD.
- **RGPD:** consentimiento obligatorio + Turnstile en paso final; PII solo en envío al backend.
- **Dependencias:** GTK-28, GTK-63, GTK-44, GTK-46, GTK-47 (cerradas).

## Fuera de alcance

- Calculadora GTK-64 (solo pre-relleno URL cuando exista).
- Cambios en plantillas de servicio/zona que ya enlazan aquí.
- Auditoría WCAG formal (GTK-76/77).
- Modificación del Route Handler de presupuesto.
