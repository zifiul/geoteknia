# Proposal — gtk-31-lead-licitacion-api

> US: [GTK-31 — POST /api/leads/licitacion: lead de licitación con referencia de expediente](https://linear.app/geoteknia/issue/GTK-31/post-apilicitaciones-lead-de-licitacion-con-referencia-de-expediente)
> Dependencias: GTK-28 (presupuesto, ✅), GTK-29 (ubicación + DRY, ✅), GTK-26 (rate limit, ✅), GTK-27 (email, ✅), GTK-32 (`recordConversionEvent`, ✅)

## Why

Captar subcontratación geotécnica en obra pública exige un formulario con contacto corporativo y **referencia de expediente o enlace a plataforma de contratación**, con priorización CRM por importe estimado. Materializa RF-15, US-11 y RF-18 (alta automática de ficha).

## What Changes

- Nuevo `POST /api/leads/licitacion` (`app/api/leads/licitacion/route.ts`): público, Turnstile, rate limit (`leads-licitacion:{ip}`), envelope JSON estándar.
- `tenderLeadSchema` en `lib/leads/schema.ts` (contacto corporativo, `superRefine` expediente/plataforma, `.strict()`).
- Caso de uso `createTenderLead` en `lib/leads/create-tender-lead.ts` (transacción contact+lead+project, `LIC-` ref, `project_data` para organismo/URL/UTE).
- Extensión **retrocompatible** de `createProjectFromLead` con `expedienteRef?` y `estimatedValue?`.
- Contrato `docs/technical/api-spec.yml` para el nuevo endpoint.
- Tests unitarios + handler; QA con `curl` y verificación BD; **sin E2E Playwright** (label `Backend`).

## Capabilities

### New Capabilities

- `public-lead-licitacion-api`: captación HTTP de licitación, anti-abuso, persistencia CRM, email con fallbacks y evento `generate_lead` / `licitacion`.

### Modified Capabilities

- `crm-contacts-leads-projects-pipeline`: alta lead+proyecto para `lead_type=licitacion`; `createProjectFromLead` persiste `expediente_ref` y `estimated_value` cuando se aportan.
- `conversion-events`: cableado best-effort de `generate_lead` con `leadType=licitacion` tras alta de licitación.

## Impact

- **Código:** `app/api/leads/licitacion/`, `lib/leads/*`, `lib/projects/create-project-from-lead.ts`, `docs/technical/api-spec.yml`.
- **BD:** escrituras en `contacts`, `leads`, `projects`, `conversion_events` (sin migración).
- **API:** nuevo endpoint público; Turnstile y rate limit en contrato.
- **RGPD / seguridad:** PII corporativa y datos de expediente en BD EU; `gdpr_consent=true`; sin PII en logs.

## Fuera de alcance

- UI del formulario de licitaciones (ticket frontend).
- E2E Playwright en este ticket (label `Backend`).
- Cambios de schema Prisma.

## Nota de ruta

El texto original del ticket citaba `POST /api/licitaciones`; el código shipped (GTK-28/29) usa `POST /api/leads/<subtipo>`. Este change adopta **`POST /api/leads/licitacion`** por consistencia.
