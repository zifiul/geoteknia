# Proposal — gtk-46-gtm-consent-datalayer

> US: [GTK-46 — GTM, Consent Mode v2, banner RGPD y capa dataLayer](https://linear.app/geoteknia/issue/GTK-46/gtm-consent-mode-v2-banner-rgpd-y-capa-datalayer)
> Labels Linear: `Frontend`, `CHORE` (E2E Playwright **sí**; no es label `Backend`).
> Dependencias: GTK-43, GTK-44, GTK-32 (Done). Bloquea GTK-47, GTK-48–49, GTK-51, GTK-58, GTK-60–61, GTK-63–67, GTK-77.

## Why

La medición de conversiones por servicio y zona debe cumplir RGPD/LOPDGDD (Consent Mode v2 con denegación por defecto) y alimentar GA4/GTM sin duplicar el contrato de eventos ya persistido por `POST /api/eventos` (GTK-32). Hoy existe `lib/analytics/schema.ts` y el endpoint de ingesta, pero no hay GTM en el layout público, banner de consentimiento ni `pushDataLayer()` / `track.ts` en cliente. Sin esta capa, los tickets de microconversiones y plantillas públicas no pueden disparar eventos de forma uniforme ni legal.

## What Changes

- `components/analytics/gtm.tsx` — script GTM (`next/script`, `afterInteractive`) + bootstrap Consent Mode v2 `denied`.
- `components/analytics/consent-banner.tsx` — banner RGPD sobre `Dialog`/`Button` (GTK-44); trigger exportado para reconfiguración (GTK-47 enganchará en footer).
- `lib/analytics/consent.ts` — estado Consent Mode v2, categorías, persistencia (cookie/localStorage), `gtag('consent', 'update', ...)`.
- `lib/analytics/datalayer.ts` — `pushDataLayer()` tipado con `ConversionEventInput` / `CONVERSION_EVENT_NAME_VALUES` (sin tipos paralelos).
- `lib/analytics/track.ts` — `pushDataLayer` + mirror a `POST /api/eventos` solo con consentimiento de analítica; `sanitizePageUrl` compartido.
- `lib/analytics/attribution.ts` (o equivalente mínimo) — captura técnica de `utm_*` / `gclid` en dataLayer sin PII.
- `app/(public)/layout.tsx` — montaje `<GtmScript>` + `<ConsentBanner>` (RSC wrapper, hijos cliente).
- `.env.example` — `NEXT_PUBLIC_GTM_ID`.
- Página o hook de prueba documentada para E2E (evento de prueba + verificación de mirror API).
- Tests Vitest (`consent`, `datalayer`, `track`) y E2E Playwright (consent, red, teclado, mirror API).

## Capabilities

### New Capabilities

- `public-analytics-consent`: GTM, Consent Mode v2, banner RGPD, dataLayer tipado y wrapper `track` alineado con `conversionEventSchema`.

### Modified Capabilities

- _(ninguna delta en `public-eventos-api` — se consume el contrato existente; no se modifica el Route Handler)_

## Impact

- **Código:** `components/analytics/*`, `lib/analytics/{consent,datalayer,track,attribution}.ts`, layout público, tests unitarios y E2E.
- **API / contrato:** sin Route Handlers nuevos — **fase 2 del harness omitida** (cliente llama a `POST /api/eventos` ya documentado).
- **RGPD:** Consent Mode v2, sin tags de marketing/analítica antes de consentimiento; sin PII en dataLayer ni beacon.
- **Rendimiento:** GTM `afterInteractive`; banner con espacio reservado para evitar CLS.
- **Secuenciación:** enlace permanente de cookies en footer → GTK-47 (este ticket exporta trigger reutilizable).

## Fuera de alcance

- Disparo de cada evento de conversión desde su flujo (GTK-58, GTK-60–61, GTK-64–67).
- Footer público (GTK-47).
- Gate Lighthouse CI global (GTK-77); aquí solo comprobar que GTM no degrada de forma obvia en E2E/manual.
