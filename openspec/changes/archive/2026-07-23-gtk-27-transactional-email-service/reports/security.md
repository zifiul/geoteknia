# Security Scan — gtk-27-transactional-email-service

- Fecha: 2026-07-23
- Diff analizado: `main..HEAD` (7 ficheros en SAST del branch actual; cambios GTK-27 sin commitear en working tree)
- Herramientas: Semgrep (p/typescript, p/react, p/owasp-top-ten), npm audit, gitleaks, DAST script

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | PREEXISTENTE | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO | — | — | — | — |

## Detalle por chequeo

### SAST

Semgrep sobre diff `main..HEAD`: **0 findings** (79 reglas, 7 ficheros).

Revisión manual del módulo `lib/email/**`:

- `import 'server-only'` en `client.ts`, `send-lead-confirmation.ts`, `idempotency.ts`
- Validación Zod antes de envío
- Logs sin PII del cuerpo (solo `referenceNumber` + `resendId` / `error`)
- Sin HTML concatenado; plantilla React Email tipada

### SCA

`npm audit` reporta 5 vulnerabilidades en dependencias **transversales del proyecto** (`next-auth`/`@auth/core`, `next`, `postcss`, `sharp`). **Este change no añade dependencias nuevas** (`resend` y `@react-email/components` ya estaban en el stack).

| Advisory | Paquete | Introducido por GTK-27 |
|----------|---------|------------------------|
| GHSA-xmf8-cvqr-rfgj, GHSA-7rqj-j65f-68wh, GHSA-x445-f3h2-j279 | `@auth/core` / `next-auth` | No |
| GHSA-m99w-x7hq-7vfj, etc. | `next` | No |

**Estado:** ACEPTADO — deuda preexistente; fuera del alcance de GTK-27. Seguimiento en upgrade de stack.

### Secretos

gitleaks sobre commits `main..HEAD`: **no leaks found**.

### DAST

**Omitido** — servicio interno sin Route Handlers nuevos/modificados en el diff.

## Hallazgos

Ninguno bloqueante introducido por GTK-27.

## Veredicto del scan

LIMPIO (con deuda SCA preexistente documentada y aceptada)
