# Proposal — gtk-27-transactional-email-service

> US: [GTK-27](https://linear.app/geoteknia/issue/GTK-27) — Servicio de email transaccional (Resend + React Email)

## Qué

Implementar el servicio interno de email transaccional para confirmaciones de lead: wrapper Resend, plantilla React Email tipada y función de dominio `sendLeadConfirmation`.

## Por qué

La confirmación inmediata (< 2 h) con número de referencia, técnico asignado y plazo de respuesta reduce leads duplicados a competencia. Materializa RF-Q3, US-12 y el componente "Email transaccional" de arquitectura.

## Alcance

- `lib/email/client.ts`, `lib/email/templates/lead-confirmation.tsx`, `lib/email/send-lead-confirmation.ts`
- Variables `EMAIL_FROM`, `EMAIL_REPLY_TO`
- Tests unitarios Vitest
- Sin endpoints nuevos (consumido por GTK-28 y futuras US de leads)

## Fuera de alcance

- Cola de envío (documentar para fase 2)
- E2E con buzón Resend (cubierto por GTK-28)
- Persistencia de idempotencia en BD (registro in-memory MVP; fase 2)
