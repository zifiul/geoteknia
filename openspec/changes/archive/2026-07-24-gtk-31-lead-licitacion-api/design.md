# Design — gtk-31-lead-licitacion-api

> Captación pública: contacto corporativo + expediente o URL plataforma → CRM. Tercer hermano tras GTK-28/29.

## Context

- GTK-28/29 entregan patrón de Route Handler, envelope, Turnstile, rate limit, `upsertContact`, `generateUniqueReferenceNumber(tx, prefix)`, `createProjectFromLead(..., titlePrefix)`.
- GTK-32 entrega `recordConversionEvent` (`generate_lead` para presupuesto; `send_location` para ubicación).
- Columnas `expediente_ref`, `estimated_value`, `project_data` ya en `leads`/`projects`.
- Label `Backend`: QA omite E2E Playwright.

## Goals / Non-Goals

**Goals:**

- `POST /api/leads/licitacion` con `tenderLeadSchema` congelado + `api-spec.yml`.
- `createTenderLead`: transacción atómica; ref `LIC-YYYYMMDD-XXXX`; email con fallbacks; `generate_lead`/`licitacion` best-effort.
- Extender `createProjectFromLead` con `expedienteRef?` / `estimatedValue?` (retrocompatible).

**Non-Goals:**

- UI formulario licitaciones.
- Migración Prisma.
- E2E Playwright.

## Decisions

| Decisión | Motivo |
|---|---|
| Ruta `POST /api/leads/licitacion` | Consistencia con hermanos shipped (Hallazgo 1) |
| `tenderLeadSchema` propio (sin `rol`) | Contacto corporativo (Hallazgo 5) |
| `organismo`/`plataformaUrl`/`esUte` en `project_data` | Sin columnas dedicadas (Hallazgo 4) |
| `channel=formulario`, `lead_type=licitacion` | Enums existentes; diferenciación por tipo |
| Clave rate limit `leads-licitacion:{ip}` | Bucket independiente |
| Email `serviceName: 'Solicitud de licitación'`, provincia fallback | Hallazgo 6 |

### Flujo HTTP

1. Rate limit `leads-licitacion:{ip}`.
2. `tenderLeadSchema.safeParse`.
3. Turnstile `siteverify`.
4. `createTenderLead` → TX + email async + `recordConversionEvent`.
5. `201` + `{ referenceNumber }`.

### Transacción Prisma

1. Resolver provincia opcional por slug.
2. `upsertContact` (nombre, empresa, email, teléfono).
3. `generateUniqueReferenceNumber(tx, 'LIC')`.
4. `lead.create` con `expediente_ref`, `estimated_value`, `project_data`.
5. `createProjectFromLead` con `titlePrefix: 'Licitación'`, `expedienteRef`, `estimatedValue`.

## Threat model

### Superficie de ataque

- `POST /api/leads/licitacion` público (spam, flooding, PII masiva).
- Token Turnstile falsificado.
- JSON con claves extra o URLs maliciosas en `plataformaUrl`.
- Abuso para inundar CRM con expedientes ficticios.

### Actores

- Anónimo / bot (volumen).
- Atacante automatizado (multi-IP vs rate limit).
- Competidor (leads falsos de alto importe).

### Datos sensibles

- PII corporativa: nombre, empresa, email, teléfono (RGPD, consentimiento).
- Datos de expediente y URLs de contratación (contexto comercial sensible).
- Atribución UTM/GA; persistencia EU; no Claude ni logs en claro.

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Spam / DoS | Rate limit GTK-26 + Turnstile |
| T2 | Bypass Turnstile | `siteverify` server-side → 403 |
| T3 | Campos extra / inyección | Zod `.strict()`, Prisma parametrizado |
| T4 | PII en logs | Solo `referenceNumber`; secure-coding |
| T5 | Sin consentimiento | `z.literal(true)` |
| T6 | Huérfanos lead/project | Transacción única |
| T7 | Sin expediente ni URL | `superRefine` → 400 |
| T8 | URL no http(s) válida | Zod `.url()` en `plataformaUrl` |

### Requisitos de seguridad (criterios de aceptación)

- SEC-31-1: Endpoint público con Turnstile obligatorio (403/502).
- SEC-31-2: Rate limit 429 con `Retry-After`.
- SEC-31-3: Validación Zod estricta; sin RBAC (público por diseño).
- SEC-31-4: Sin PII en logs del handler ni en respuestas de error detalladas.

### Amenazas descartadas

- **RBAC / IDOR:** captación pública; sin GET por referencia en este ticket.
- **Audit log:** trazabilidad en `leads` / `conversion_events`.

## Trazabilidad

- Linear: GTK-31
- Specs vivas afectadas: `public-lead-licitacion-api` (nueva), deltas en `crm-contacts-leads-projects-pipeline` y `conversion-events`.
