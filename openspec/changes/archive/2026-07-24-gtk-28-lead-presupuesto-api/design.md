# Design — gtk-28-lead-presupuesto-api

> Captación pública: presupuesto multi-paso → CRM + email. Base reutilizable para GTK-29/30/31.

## Context

- CRM schema y seed `lead-nuevo` ya existen (GTK-12).
- GTK-26 entrega `checkRateLimit` + `readRateLimitEnv()` (`publicPerMin`, default 20).
- GTK-27 entrega `sendLeadConfirmation` (idempotente por `referenceNumber`, sin PII en logs).
- `lib/leads` y `lib/projects` son barriles vacíos; no hay Route Handlers de negocio salvo Auth.js.
- Label `Backend`: QA omite E2E Playwright (harness § Regla QA).
- `ProjectStateHistory.changedById` es obligatorio → **no** historial en alta anónima (Hallazgo GTK-28).

## Goals / Non-Goals

**Goals:**

- `POST /api/leads/presupuesto` con contrato Zod congelado + `api-spec.yml`.
- Turnstile server-side (`lib/security/turnstile.ts`).
- Transacción atómica contact (dedupe) + lead + project.
- Helpers DRY: `contactBaseSchema`, `deriveLeadSource`, `generateReferenceNumber`, `createProjectFromLead`, `createBudgetLead`.
- Rate limit 429 + `Retry-After`.
- Email post-commit no bloqueante.

**Non-Goals:**

- UI del formulario.
- `lib/analytics/record-event` (GTK-32); hook comentado o no-op.
- `project_state_history` en captación pública.
- E2E Playwright en este ticket.

## Decisions

| Decisión | Alternativa | Motivo |
|---|---|---|
| Ruta `app/api/leads/presupuesto/route.ts` | `POST /api/leads` | `backend-standards.md` §5.1 y hermanos GTK-29+ |
| `budgetLeadSchema` en `lib/leads/schema.ts` con `.strict()` | Schema solo en OpenAPI | Contrato Zod compartido front/back |
| Dedupe contacto `OR` email/phone, `deletedAt: null` | Siempre insert | RF CRM + ticket |
| Título proyecto `` `Presupuesto ${service} — ${province} (${ref})` `` | Título fijo | `Project.title` NOT NULL |
| Errores de dominio → `LeadCaptureError` con `status` + `code` | Excepciones genéricas | Mapeo uniforme a `ApiErrorEnvelope` |
| `lib/http/api-envelope.ts` mínimo (`apiSuccess`, `apiError`) | Solo inline en route | Reutilización GTK-29+ |
| Turnstile 403 `TURNSTILE_INVALID`, red 502 `TURNSTILE_UNAVAILABLE` | Todo 403 | Contrato ticket |
| IP desde `x-forwarded-for` (primer hop) | `request.ip` | Vercel/proxy |

### Flujo HTTP

1. Rate limit por IP (`leads-presupuesto:{ip}`).
2. `request.json()` → `budgetLeadSchema.safeParse`.
3. `verifyTurnstileToken(turnstileToken, remoteIp)`.
4. `createBudgetLead(parsed)` → transacción + email async.
5. `201` + `{ referenceNumber }`.

### Transacción Prisma

Dentro de `$transaction`:

1. Resolver catálogos por slug.
2. `upsertContactForLead` (findFirst email OR phone).
3. Bucle reintento `reference_number`.
4. `lead.create` + `createProjectFromLead`.

Fuera: `void sendLeadConfirmation(...).catch(log)` — sin await bloqueante en tests se puede await en unit tests del caso de uso.

## Threat model

### Superficie de ataque

- `POST /api/leads/presupuesto` público (spam, flooding, inyección, PII masiva).
- Token Turnstile falsificado o replay.
- Payload oversize / claves extra (bypass cliente).

### Actores

- Anónimo / bot (spam, credential stuffing no aplica).
- Atacante automatizado (rate limit bypass multi-IP).
- Competidor (envío masivo de leads falsos).

### Datos sensibles implicados

- PII: nombre, email, teléfono, empresa (RGPD, base legal consentimiento).
- Atribución marketing (UTM, GA client id).
- Persistencia EU (Neon); no enviar a Claude ni logs en claro.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Spam / DoS | Volumen POST | Alto | Rate limit GTK-26 + Turnstile |
| T2 | Bypass Turnstile | Token vacío o robado | Alto | `siteverify` server-side, 403 |
| T3 | Inyección / campos extra | JSON malicioso | Medio | Zod `.strict()`, Prisma parametrizado |
| T4 | PII en logs/Sentry | `console.error(body)` | Alto | Solo `referenceNumber`; política secure-coding |
| T5 | Lead sin consentimiento | Omitir checkbox | Alto | `z.literal(true)` + columna NOT NULL |
| T6 | Huérfanos lead/project | Fallo parcial TX | Alto | Transacción única Prisma |
| T7 | Enumeración catálogos | Slugs | Bajo | 400 genérico VALIDATION_ERROR |

### Amenazas descartadas

- **RBAC en endpoint:** público por diseño; no aplica permiso atómico.
- **Audit log:** captación pública; trazabilidad en `leads` (ticket).
- **IDOR post-creación:** no hay GET de lead por referencia en este ticket.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Payload sin Turnstile válido → `403 TURNSTILE_INVALID`, sin filas nuevas en BD.
- [ ] SEC-2: Claves extra en JSON → `400 VALIDATION_ERROR` (strict).
- [ ] SEC-3: Superar `publicPerMin` → `429 RATE_LIMITED` + `Retry-After`.
- [ ] SEC-4: Logs del handler sin email/teléfono/nombre (revisión code-review + tests).
- [ ] SEC-5: `gdprConsent` distinto de `true` → `400`, sin escritura.
- [ ] SEC-6: Slug inexistente → `400`, sin 500 ni stack al cliente.

## Risks / Trade-offs

- Rate limit in-memory no compartido entre isolates (documentado GTK-26).
- Email fallido → lead sin confirmación (operación manual); aceptado MVP.
- Sin `conversion_events` hasta GTK-32.

## Open Questions

- Ninguna bloqueante: enum `rol` del formulario fijado en ticket (`propiedad`…`otro`).
