# Design — gtk-27-transactional-email-service

## Arquitectura

```
sendLeadConfirmation(input)
  → Zod validate
  → idempotency check (referenceNumber)
  → LeadConfirmationEmail template (React Email)
  → sendEmail (Resend client)
  → log result (referenceNumber + resend id, sin PII)
  → return { ok, id?, skipped?, error? }
```

## Decisiones

| Decisión | Elección | Motivo |
|---|---|---|
| Idempotencia MVP | Registro in-memory por `referenceNumber` | Sin migración BD; suficiente para reintentos en mismo proceso |
| Degradación elegante | No lanza; retorna `{ ok: false }` y loguea | Fallo Resend no revierte creación de lead |
| Fallback técnico | Constante `[PENDIENTE: ...]` | Copy pendiente de validación con negocio |
| Server-only | `import 'server-only'` en todos los módulos | SEC-1: clave Resend nunca en cliente |

## Threat model

| Superficie | Riesgo | Mitigación |
|---|---|---|
| RESEND_API_KEY | Exposición al cliente | server-only + env server-side |
| PII en logs | Email/nombre en logs | Solo `referenceNumber` + id Resend |
| Input malformado | Envío a destinatario inválido | Zod en entrada |

## Fase 2 (documentar)

- Cola async (Inngest/Trigger.dev) para SLA < 2 h bajo carga
- Tabla `email_deliveries` para idempotencia persistente cross-instance
