# Code Review — GTK-27 Servicio de email transaccional

**Fecha:** 2026-07-23  
**Change:** `gtk-27-transactional-email-service`  
**Revisor:** agente (Harness fase 6)

## Alcance revisado

- `lib/email/client.ts`, `idempotency.ts`, `send-lead-confirmation.ts`, `index.ts`
- `lib/email/templates/lead-confirmation.ts`, `lead-confirmation-email.tsx`
- `lib/env.ts`, `.env.example`, `tests/unit/email/send-lead-confirmation.test.ts`, `tests/unit/env.test.ts`
- Artefactos OpenSpec del change

## Alineación spec ↔ implementación

| Requisito | Estado |
|-----------|--------|
| `sendLeadConfirmation` con Zod y campos GTK-27 | ✅ |
| Plantilla React Email tipada (sin HTML concatenado) | ✅ |
| Degradación elegante (no revierte negocio) | ✅ |
| Idempotencia por `referenceNumber` | ✅ |
| `RESEND_API_KEY` / email solo server-side | ✅ |
| Fallback técnico pendiente de negocio | ✅ |
| Consumo previsto desde GTK-28 post-commit | ✅ Documentado |

## Checklist backend

| Criterio | Estado |
|----------|--------|
| `server-only` en módulos con secretos/Resend | ✅ |
| Validación Zod de entrada | ✅ |
| Retorno tipado `{ ok, id?, error?, skipped? }` | ✅ |
| Sin PII innecesaria en logs | ✅ |
| Tests unitarios cubren criterios GTK-27 | ✅ |
| Sin endpoints HTTP nuevos | ✅ |

## Sección de seguridad

- Resultado del scan (5b): **LIMPIO** — SAST y secretos sin hallazgos; DAST omitido (sin API).
- SCA: vulnerabilidades preexistentes en `next`/`next-auth`; no introducidas por este change — **aceptadas** con justificación en `reports/security.md`.
- Checklist OWASP: sin desviaciones relevantes para servicio interno server-only.

Veredicto: APTO
