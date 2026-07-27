# Propuesta — gtk-65-microconversion-ubicacion

> Ticket: [GTK-65](https://linear.app/geoteknia/issue/GTK-65/microconversion-enviar-ubicacion-de-la-parcela-maps-catastral) | Rama: `feature/frontend-gtk-65-microconversion-ubicacion`

## Why

La microconversión «enviar ubicación» (RF-Q2, US-07) completa el embudo de campo: referencia catastral o coordenadas + contacto mínimo en ~15 s, sin el formulario largo. El backend (`POST /api/leads/ubicacion`, GTK-29) y thank-you (`/gracias/ubicacion`, GTK-63) ya existen; falta el widget flotante y su montaje en plantillas públicas.

## What Changes

- `LocationWidget` (FAB + `Dialog` / bottom sheet móvil) con formulario validado por `locationLeadSchema`.
- **Opción A (MVP):** referencia catastral principal + geolocalización opcional del navegador (`navigator.geolocation`); sin Google Maps JS API ni `MapPicker`.
- Envío a `POST /api/leads/ubicacion`, redirección `201` → `/gracias/ubicacion?ref=`.
- Tracking: `form_start` (datalayer raw al abrir) y `send_location` (canónico) con `serviceSlug` / `provinceSlug` del contexto.
- Montaje inicial en `app/(public)/servicios/[slug]/page.tsx` (GTK-49).
- UI según Stitch (comentario Linear): desktop `d21e5c30da0a46e7aa98202fa8c763c7`, mobile `6669d1bb28624974a73e4c1ea36194c4`.
- Tests unitarios (validación) y E2E Playwright.

## Capabilities

### New Capabilities

- `public-location-widget`: widget de microconversión ubicación, accesible y mobile-first.

### Modified Capabilities

- (ninguna — contrato `locationLeadSchema` y API GTK-29 sin cambios)

## Impact

- **Frontend:** `components/organisms/conversion/LocationWidget.tsx`, montaje en página de servicio.
- **API:** solo consumo de endpoint existente.
- **Env:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (ya presente); sin `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Opción A).
- **Dependencias:** GTK-29, GTK-63, GTK-44, GTK-46, GTK-49 (cerradas).

## Fuera de alcance

- `MapPicker` / Google Maps JS API (Opción B).
- Montaje en geo-landing (GTK-51) y detalle de caso (GTK-53) hasta que esas plantillas lo integren.
- Auditoría WCAG formal (GTK-76/77).
