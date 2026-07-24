# Proposal — gtk-28-lead-presupuesto-api

> US: [GTK-28 — POST /api/leads/presupuesto: formulario de presupuesto (Zod + Turnstile + ficha + email)](https://linear.app/geoteknia/issue/GTK-28/post-apileads-formulario-de-presupuesto-zod-turnstile-ficha-email)
> Dependencias: GTK-26 (rate limit, en rama base o `main` según merge), GTK-27 (email transaccional, ✅), catálogos CRM en Prisma (✅)
> Desbloquea: GTK-29/30/31 (endpoints hermanos de captación reutilizando helpers)

## Why

El formulario de presupuesto es el principal punto de conversión B2B: sin un endpoint público fiable no hay captación medible ni alta automática de ficha de proyecto. Hay que validar en servidor, frenar spam (Turnstile + rate limit), persistir PII con consentimiento RGPD, deduplicar contactos y confirmar por email sin bloquear la respuesta HTTP.

## What Changes

- Nuevo `POST /api/leads/presupuesto` (`app/api/leads/presupuesto/route.ts`): público, Turnstile, rate limit GTK-26, envelope JSON estándar.
- Módulo `lib/leads/*`: schemas Zod (`.strict()`), atribución UTM, `reference_number`, caso de uso transaccional contact+lead+project.
- Módulo `lib/projects/create-project-from-lead.ts` reutilizable por captaciones futuras.
- Nuevo `lib/security/turnstile.ts` (`verifyTurnstileToken`).
- Contrato en `docs/technical/api-spec.yml` (primer endpoint de leads; reutiliza `ApiErrorEnvelope`).
- Tests unitarios + handler; QA con `curl` y verificación BD; **sin E2E Playwright** (label `Backend`).

## Capabilities

### New Capabilities

- `public-lead-presupuesto-api`: captación HTTP del formulario de presupuesto, anti-abuso, persistencia CRM y email de confirmación.

### Modified Capabilities

- `crm-contacts-leads-projects-pipeline`: comportamiento en runtime del alta automática lead+proyecto vía API pública (además del schema ya materializado).
- `transactional-email-service`: integración obligatoria de `sendLeadConfirmation` tras alta de presupuesto (no bloqueante para el 201).

## Impact

- **Código:** `app/api/leads/presupuesto/`, `lib/leads/*`, `lib/projects/create-project-from-lead.ts`, `lib/security/turnstile.ts`, `docs/technical/api-spec.yml`.
- **BD:** escrituras en `contacts`, `leads`, `projects` (sin migración si el schema ya cubre campos).
- **API:** nuevo endpoint público; declara rate limit y Turnstile en contrato.
- **SEO:** sin impacto directo (API JSON).
- **RGPD / seguridad:** PII en BD EU; sin PII en logs; consentimiento obligatorio; Turnstile server-side.

## Fuera de alcance

- UI del formulario multi-paso (ticket frontend futuro).
- `POST /api/leads/ubicacion`, lead magnet, licitación (GTK-29/30/31).
- Registro `conversion_events` / `lib/analytics` (GTK-32; punto de extensión best-effort).
- Fila en `project_state_history` en el alta anónima (decisión de diseño GTK-28).
- E2E Playwright en este ticket (label `Backend`).
