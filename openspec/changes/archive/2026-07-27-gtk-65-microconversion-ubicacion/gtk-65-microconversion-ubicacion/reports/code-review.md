# Code Review — gtk-65-microconversion-ubicacion

## Alcance

`LocationWidget` (FAB Stitch + dialog/bottom sheet), montaje en página de servicio, tests unit/E2E.

## Checklist

- [x] Reutiliza `locationLeadSchema`, `Dialog`, `TenderForm` patterns (`interpretLeadSubmitResponse`, Turnstile).
- [x] Opción A documentada; sin Google Maps API key.
- [x] Tracking `form_start` + `send_location` con contexto servicio/provincia.
- [x] Accesibilidad: dialog Radix, `role="alert"`, FAB ≥44px.
- [x] `reports/security.md` limpio.

## Seguridad

Sin superficie HTTP nueva. PII solo en POST al backend existente.

## Veredicto: APTO
