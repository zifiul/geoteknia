# Proposal — gtk-32-eventos-conversion

> US: [GTK-32 — POST /api/eventos: ingesta de eventos de conversión (espejo de GA4)](https://linear.app/geoteknia/issue/GTK-32/post-apieventos-ingesta-de-eventos-de-conversion-espejo-de-ga4)
> Dependencias: GTK-14 (tabla `conversion_events` ✅), GTK-12 (CRM ✅), GTK-26 (rate limiting ✅); GTK-28 (leads ✅, sin `generate_lead` aún)
> Desbloquea: GTK-33 (calculadora), GTK-46 (GTM/dataLayer), microconversiones frontend (GTK-60/61/64–67)

## Why

La tabla `conversion_events` ya existe (GTK-14) pero no hay punto de escritura: ni HTTP público para la capa GTM/dataLayer ni helper server-side para los casos de uso de captación. Sin eso no hay atribución interna ni CPL por servicio/zona independientes de GA4. GTK-28 ya crea leads y **aún no registra** `generate_lead`; este change cierra ese hueco.

## What Changes

- Nuevo módulo `lib/analytics/*`: schemas Zod (`.strict()`, enums Prisma), saneo de `page_url`, helpers append-only `recordConversionEvent` / `recordConversionEvents` (best-effort, `tx?` opcional).
- Nuevo `POST /api/eventos` (`app/api/eventos/route.ts`): público, parseo tolerante a `Content-Type` (beacon), rate limit contando **eventos**, respuesta `202`.
- Cableado en `lib/leads/create-lead.ts`: tras crear el lead, `recordConversionEvent({ eventName: 'generate_lead', ... })` best-effort.
- Contrato en `docs/technical/api-spec.yml` (lote + beacon; reutiliza `ApiErrorEnvelope`).
- Tests unitarios + handler; QA con `curl` y verificación BD; **sin E2E Playwright** (label `Backend` — harness).

## Capabilities

### New Capabilities

- `public-eventos-api`: ingesta HTTP y helper de dominio para `conversion_events` (doble consumidor: beacon/GTM + llamadores internos).

### Modified Capabilities

- `public-lead-presupuesto-api`: el alta de presupuesto SHALL registrar `generate_lead` vía `recordConversionEvent` sin bloquear el `201` si la telemetría falla.

## Impact

- **Código:** `lib/analytics/*` (nuevo), `app/api/eventos/route.ts`, `lib/leads/create-lead.ts`, `docs/technical/api-spec.yml`.
- **BD:** inserts append-only en `conversion_events` (sin migración; schema GTK-14).
- **API:** nuevo endpoint público; rate limit + sin Turnstile (documentado).
- **SEO:** sin impacto (API JSON).
- **RGPD / seguridad:** sin PII directa; `page_url` saneado; `session_id`/`ga_client_id` como pseudónimos técnicos; anti-enumeración de `lead_id`.

## Fuera de alcance

- UI / dataLayer / Consent Mode / banner RGPD (GTK-46 y tickets frontend).
- Cableado en GTK-29/30/31 y GTK-33 (consumirán el helper cuando se implementen).
- Reporting CPL / dashboards de back-office.
- Turnstile en `/api/eventos` (telemetría de alto volumen; defensa = rate limit + `.strict()` + saneo).
- E2E Playwright en este ticket (label `Backend`; flujo navegador en US frontend/GTM).
