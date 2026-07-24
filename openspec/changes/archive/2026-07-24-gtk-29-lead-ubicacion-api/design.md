# Design — gtk-29-lead-ubicacion-api

> Microconversión pública: ubicación (catastral o mapa) + contacto mínimo → CRM. Hermano ligero de GTK-28.

## Context

- GTK-28 entrega `POST /api/leads/presupuesto`, `lib/http/api-envelope.ts`, Turnstile, rate limit, `createBudgetLead`, `createProjectFromLead` (título fijo "Presupuesto", ref `PRE-`).
- GTK-32 entrega `recordConversionEvent` (usar `send_location`).
- Enums `lead_type` y `channel` `ubicacion` ya en Prisma.
- Label `Backend`: QA omite E2E Playwright.
- `contactBaseSchema` de presupuesto exige nombre, email, teléfono y rol → **no** reutilizar para ubicación.

## Goals / Non-Goals

**Goals:**

- `POST /api/leads/ubicacion` con `locationLeadSchema` congelado + `api-spec.yml`.
- Refactor DRY: `generateUniqueReferenceNumber(tx, prefix)`, `upsertContact`, `buildProjectTitle(..., prefix)`.
- Transacción atómica contact (opcional) + lead + project; `reference_number` `UBI-YYYYMMDD-XXXX`.
- Email post-commit solo si hay email; `send_location` best-effort.
- Reutilizar patrón de route de `presupuesto` (IP, rate limit, Turnstile, envelope).

**Non-Goals:**

- UI del widget.
- Migración Prisma.
- `project_state_history` en alta anónima (igual que GTK-28).
- E2E Playwright.

## Decisions

| Decisión | Alternativa | Motivo |
|---|---|---|
| `locationLeadSchema` propio con `superRefine` | Reutilizar `contactBaseSchema` | Ticket: contacto mínimo email OR teléfono |
| Prefijo ref `UBI-` | Seguir `PRE-` | Diferenciar operaciones en CRM |
| Extraer `upsertContact` antes del caso de uso ubicación | Duplicar lógica | DRY + tests GTK-28 como red de seguridad |
| `createLocationLead` en archivo dedicado | Ampliar `create-lead.ts` | Separación por tipo de lead |
| Clave rate limit `leads-ubicacion:{ip}` | Misma que presupuesto | Buckets independientes por endpoint |
| Provincia opcional | Obligatoria | Microconversión móvil; resolver slug si viene |
| Sin servicio en lead/project | Servicio genérico | `service_id` null soportado por `createProjectFromLead` |

### Flujo HTTP

1. Rate limit por IP (`leads-ubicacion:{ip}`).
2. `request.json()` → `locationLeadSchema.safeParse`.
3. `verifyTurnstileToken(turnstileToken, remoteIp)`.
4. `createLocationLead(parsed)` → transacción + email async condicional + `recordConversionEvent`.
5. `201` + `{ referenceNumber }`.

### Transacción Prisma

Dentro de `$transaction`:

1. Resolver `province_id` por slug si `provincia` presente.
2. `upsertContact` con campos opcionales.
3. `generateUniqueReferenceNumber(tx, 'UBI')`.
4. `lead.create` (`lead_type`/`channel` ubicacion, catastral/coords) + `createProjectFromLead` con prefijo título `Ubicación`.

Fuera: email condicional; `void recordConversionEvent(...).catch(log)`.

## Threat model

### Superficie de ataque

- `POST /api/leads/ubicacion` público (spam, flooding, payloads con PII/localización masiva).
- Token Turnstile falsificado.
- JSON con claves extra o coordenadas fuera de rango.
- Abuso de microconversión para geolocalizar terceros (datos de parcela inventados).

### Actores

- Anónimo / bot (spam, volumen).
- Atacante automatizado (rate limit bypass multi-IP).
- Competidor (leads falsos con coordenadas aleatorias).

### Datos sensibles implicados

- PII: email, teléfono, nombre opcional (RGPD, consentimiento).
- Localización: referencia catastral, lat/lng (dato sensible de contexto obra).
- Atribución UTM/GA; persistencia EU; no Claude ni logs en claro.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Spam / DoS | Volumen POST | Alto | Rate limit GTK-26 + Turnstile |
| T2 | Bypass Turnstile | Token vacío | Alto | `siteverify` server-side, 403 |
| T3 | Inyección / campos extra | JSON malicioso | Medio | Zod `.strict()`, Prisma parametrizado |
| T4 | PII/localización en logs | `console.error(body)` | Alto | Solo `referenceNumber`; secure-coding |
| T5 | Lead sin consentimiento | Omitir checkbox | Alto | `z.literal(true)` |
| T6 | Huérfanos lead/project | Fallo parcial TX | Alto | Transacción única |
| T7 | Coordenadas inválidas | Valores extremos | Medio | Zod min/max + par lat/lng |
| T8 | Contacto vacío | Sin email ni teléfono | Medio | `superRefine` → 400 |

### Amenazas descartadas

- **RBAC:** endpoint público por diseño.
- **Audit log:** trazabilidad en `leads` / `conversion_events`.
- **IDOR:** no hay GET por referencia en este ticket.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Token Turnstile inválido → `403 TURNSTILE_INVALID`, sin filas nuevas.
- [ ] SEC-2: Claves extra en JSON → `400 VALIDATION_ERROR` (strict).
- [ ] SEC-3: Superar `publicPerMin` → `429 RATE_LIMITED` + `Retry-After`.
- [ ] SEC-4: Logs sin email/teléfono/catastral/coords (code-review + tests).
- [ ] SEC-5: `gdprConsent !== true` → `400`, sin escritura.
- [ ] SEC-6: Sin ubicación ni contacto → `400`, sin escritura.
- [ ] SEC-7: Solo `mapLat` o solo `mapLng` → `400`, sin escritura.

## Risks / Trade-offs

- Refactor en `create-lead.ts` puede romper presupuesto → ejecutar suite GTK-28 tras extracción.
- Email omitido con solo teléfono → confirmación manual por gestor (documentado).
- Rate limit in-memory entre isolates (GTK-26).

## Open Questions

- Ninguna bloqueante.
