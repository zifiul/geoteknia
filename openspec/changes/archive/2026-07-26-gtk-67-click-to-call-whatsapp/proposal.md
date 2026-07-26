# Proposal — gtk-67-click-to-call-whatsapp

> US: [GTK-67 — Click-to-call y WhatsApp Business segmentado](https://linear.app/geoteknia/issue/GTK-67/click-to-call-y-whatsapp-business-segmentado-con-mensaje-pre-rellenado)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — showcase desktop `a9ea770cdf31498c8b533e7f5576ae25` (patrones integrados en header GTK-47 + barra sticky).

## Why

Cerrar RF-08/US-05: contacto B2B segmentado por departamento, WhatsApp con mensaje contextual y eventos GA4 `click_tel` / `click_whatsapp` / `click_email` con dimensiones servicio/provincia. La infraestructura GTK-47/GTK-46 existe; faltan lectura por departamento, plantilla WhatsApp y propagación de contexto.

## What Changes

- `getContactChannelByDepartment()` y `prefilledMessageTemplate` en `PublicContactChannel` (sin cambiar `getGeneralContactChannel()`).
- Contrato de plantilla `{{servicio}}` / `{{provincia}}` (alineado con seed GTK-11).
- `buildWhatsAppUrl(number, message?)`, `lib/contact/build-whatsapp-message.ts`, reglas de departamento por ruta.
- `PhoneLink` con `serviceSlug`/`provinceSlug`; header desktop con teléfono **y** WhatsApp; sticky con contexto y mensaje pre-rellenado.
- `TenderMailtoLink` (wrapper `ContactTrackLink`) listo para `/licitaciones` y GTK-60.
- Tests Vitest + E2E Playwright.

## Capabilities

### New Capabilities

- `public-segmented-contact-channels`: canales por `ContactDepartment`, WhatsApp pre-rellenado y tracking contextual en layout público.

### Modified Capabilities

- Ninguna delta en specs vivas de organización (solo consumo de campos ya modelados).

## Impact

- **Contrato API:** omitido (sin Route Handlers nuevos).
- **Datos:** lectura de `contact_channels` existente.
- **GTK-60 / GTK-58:** consumirán los mismos lectores y `TenderMailtoLink`.

## Fuera de alcance

- Página contacto completa (GTK-60).
- Auditoría WCAG formal (GTK-76).
