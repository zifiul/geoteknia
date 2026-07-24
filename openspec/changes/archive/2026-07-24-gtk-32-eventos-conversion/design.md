# Design — gtk-32-eventos-conversion

> Ingesta de `conversion_events`: doble consumidor (HTTP beacon + helper interno) y cableado de `generate_lead` en GTK-28.

## Context

- Tabla y enum `ConversionEventName` (8 valores, incl. `scroll_depth`) ya materializados (GTK-14 / spec `conversion-events`).
- Rate limit reutilizable GTK-26 (`checkRateLimit`, `readRateLimitEnv().publicPerMin`).
- GTK-28 (`createBudgetLead`) en `main` **sin** registro de conversión.
- `lib/analytics/` no existe; patrón de referencia: `recordAudit` en `lib/audit/log.ts` (best-effort).
- Label `Backend`: QA omite E2E Playwright (harness § Regla QA — E2E queda en US frontend/GTM, p. ej. GTK-46).

## Goals / Non-Goals

**Goals:**

- `POST /api/eventos` con Zod congelado + `api-spec.yml` (evento | lote ≤ 50, 202, beacon-friendly).
- Helper `recordConversionEvent(s)` append-only, best-effort, `tx?`.
- Saneo `page_url`; `lead_id` inexistente → `null`; rate limit contando eventos.
- Cablear `generate_lead` en `lib/leads/create-lead.ts` post-commit.

**Non-Goals:**

- UI / GTM / Consent Mode.
- Cableado en GTK-29/30/31/33 (solo dejar el helper listo).
- Turnstile en este endpoint.
- E2E Playwright en este ticket.

## Decisions

| Decisión | Alternativa | Motivo |
|---|---|---|
| Módulo nuevo `lib/analytics/*` | Meter en `lib/leads` | Dominio de telemetría transversal; consumidores múltiples |
| Zod `z.nativeEnum(ConversionEventName)` | Allow-list manual de 7 | Cero drift con Prisma (Hallazgo 2) |
| Parseo `JSON.parse(await request.text())` | Exigir `application/json` | Compatibilidad `sendBeacon` (`text/plain`) |
| Éxito HTTP `202` | `204` / `200` | Ticket + cuerpo mínimo `{ recorded }` |
| Rate limit: N eventos = N unidades | 1 request = 1 unidad | Evitar amplificación con lotes de 50 |
| `leadId` inexistente → null | 400 | Anti-enumeración + telemetría resiliente |
| `generate_lead` post-commit (fuera de TX) | Dentro de `$transaction` | No alargar TX CRM; telemetría no debe revertir leads |
| Sin Turnstile | Igual que leads | Alto volumen; defensa = RL + strict + saneo |
| Envelope vía `apiSuccess`/`apiError` | Inline | Reutilizar `lib/http/api-envelope.ts` de GTK-28 |

### Flujo HTTP

1. Resolver IP (`x-forwarded-for` primer hop).
2. Leer cuerpo como texto → `JSON.parse` (400 si no es JSON).
3. `ingestSchema.safeParse` → normalizar a array de eventos.
4. Rate limit: intentar consumir `events.length` unidades (`eventos:{ip}`); si no cabe → 429.
5. `recordConversionEvents(events)` (degrada FK, sanea URL).
6. `202` + `{ recorded }`.

### Helper

- Sanea `pageUrl` en `sanitize.ts` antes del insert.
- Si `leadId` presente: `findUnique` o captura P2003 → insertar con `leadId: null`.
- Nunca acepta `occurredAt` del input; Prisma `@default(now())`.
- Logs: solo conteos / códigos; sin body ni PII.

## Threat model

### Superficie de ataque

- `POST /api/eventos` público (flooding, basura, sondeo de `lead_id`, inyección de PII vía querystring/`extra` keys).
- Amplificación por lotes (50 eventos/request en bucle).
- Consumo de almacenamiento append-only.

### Actores

- Anónimo / bot (spam de telemetría).
- Atacante que intenta enumerar leads por UUID.
- Integración legítima GTM/beacon y llamadores internos de confianza.

### Datos sensibles implicados

- No PII directa (nombre/email/teléfono).
- Pseudónimos: `session_id`, `ga_client_id` (base legal: consentimiento analítica — Consent Mode en frontal, fuera de alcance).
- `page_url` puede filtrar PII en query → saneo obligatorio.
- Persistencia EU (Neon).

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Flood / DoS de inserts | POST masivo / lotes | Alto | Rate limit contando eventos + tope lote 50 |
| T2 | PII en `page_url` o claves extra | Querystring / keys libres | Alto | Saneo origin+pathname + Zod `.strict()` |
| T3 | Enumeración de leads | `leadId` UUID | Medio | Degradar a null; misma respuesta 202 |
| T4 | Contaminación del enum / schema | `event_name` inventado | Medio | `z.nativeEnum` + 400 |
| T5 | Fallo de telemetría rompe captación | Excepción en create-lead | Alto | Best-effort; nunca lanza al caller |
| T6 | Overflow numérico | `value`/`form_step` string absurdo | Bajo | `z.coerce` + límites |

### Amenazas descartadas

- **Turnstile:** telemetría fire-and-forget de alto volumen; coste UX/GTM inaceptable.
- **RBAC / audit_log:** endpoint público de telemetría; no es acción de portal.
- **IDOR de lectura:** no hay GET de eventos en este ticket.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Claves desconocidas o `eventName` inválido → `400 VALIDATION_ERROR`, sin insert.
- [ ] SEC-2: Superar `publicPerMin` eventos → `429 RATE_LIMITED` + `Retry-After`.
- [ ] SEC-3: `pageUrl` con query → persistido sin querystring.
- [ ] SEC-4: `leadId` inexistente → insert con `lead_id=null` y respuesta de éxito (sin 400).
- [ ] SEC-5: Logs del handler sin cuerpo completo ni PII (solo conteos/códigos).
- [ ] SEC-6: Fallo de `recordConversionEvent` en `createBudgetLead` no altera el éxito del alta.

## Risks / Trade-offs

- Rate limit in-memory por isolate (limitación conocida GTK-26) → Mitigación: documentar; Upstash futuro.
- Sin Turnstile → más spam posible → Mitigación: RL por eventos + tope lote + strict.
- `generate_lead` post-commit puede perderse si el proceso muere → Aceptado (best-effort telemetría).
- E2E omitido (label Backend) → Mitigación: curl + unit + US frontend.

## Open Questions

- Ninguna bloqueante. Consent banner / base legal de `ga_client_id` documentada como dependencia de GTK-46.
