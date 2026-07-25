# Design — gtk-46-gtm-consent-datalayer

## Context

GTK-43 dejó `app/(public)/layout.tsx` como wrapper mínimo. GTK-44 aporta `Dialog` y `Button` accesibles. GTK-32 define `conversionEventSchema` (`.strict()`), `POST /api/eventos` con rate limit y `recordConversionEvents`. `sanitizePageUrl` en `lib/analytics/sanitize.ts` es importable desde cliente. `frontend-standards.md` §11 documenta eventos canónicos y principios RGPD. GTK-47 (footer) viene después; el criterio de “enlace en footer” se resuelve exportando API de reconfiguración.

## Goals / Non-Goals

**Goals:**

- Consent Mode v2 con denegación por defecto y actualización tras interacción del banner.
- Banner RGPD con categorías (esenciales / analítica / marketing según diseño acordado) sobre design system.
- `pushDataLayer` + `track` como única frontera cliente alineada con `ConversionEventInput`.
- Mirror best-effort a `/api/eventos` solo con consentimiento de analítica.
- E2E: red, dataLayer, teclado, mirror API.
- `NEXT_PUBLIC_GTM_ID` en `.env.example`.

**Non-Goals:**

- Implementar cada microconversión (GTK-65–67, etc.).
- Footer y enlace legal de cookies (GTK-47).
- Modificar `app/api/eventos/route.ts` o Prisma.
- Lighthouse CI gate global (GTK-77).

## Decisions

### Contrato de eventos: una sola fuente de verdad

**Decisión:** `datalayer.ts` y `track.ts` importan `ConversionEventInput`, `CONVERSION_EVENT_NAME_VALUES` y `conversionEventNameSchema` desde `lib/analytics/schema.ts`. No se crean alias `event` / `servicio` / `lead_type`.

**Alternativa descartada:** tipos paralelos del ticket original (romperían `.strict()` en el mirror).

### Consent vs dataLayer

**Decisión:** eventos de conversión GA4 (`pushDataLayer` / mirror API) solo con consentimiento de **analítica**. Consent Mode actualiza las cuatro señales v2. Tags de marketing dependen de categoría marketing si se modela por separado; por defecto marketing sigue `denied` hasta aceptación explícita.

**Atribución UTM/gclid:** push técnico inicial (`consent` / `attribution_capture`) sin PII en query almacenada; solo claves de campaña documentadas. No sustituye consentimiento para tags GA4.

### Persistencia de consentimiento

**Decisión:** cookie con nombre acotado (`geoteknia_consent` o similar) + JSON versionado; TTL documentado (p. ej. 12 meses). `localStorage` opcional como espejo de lectura rápida. Al cargar, aplicar `gtag('consent', 'default'|'update', ...)`.

### GTM bootstrap

**Decisión:** inline script antes de GTM container para `gtag('consent', 'default', { ... denied })`; luego `GtmScript` con ID de env. Si no hay ID, omitir container pero mantener banner (modo desarrollo).

### Componentes cliente

**Decisión:** `gtm.tsx` y `consent-banner.tsx` con `'use client'`. Layout público permanece Server Component importando estos hijos. Botón flotante mínimo “Cookies” llama a `openConsentPreferences()` para cumplir reconfiguración sin footer.

### track.ts y fetch

**Decisión:** `fetch('/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })` sin reintentos agresivos; errores silenciosos en cliente (la BD es best-effort en servidor también).

### Página / harness E2E

**Decisión:** ruta de prueba `app/(public)/dev-analytics/page.tsx` (o reutilizar patrón `dev-seo`) con `noindex`, botón que dispara evento de prueba vía `track`, solo para E2E — documentado en threat model.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| PII en query de `pageUrl` | `sanitizePageUrl` en dataLayer y mirror |
| Duplicar eventos por re-render | `track` idempotente por acción de usuario (documentar en callers futuros) |
| CLS por banner | barra fija inferior con altura reservada, no modal full-screen en primera visita |
| GTM en dev sin ID | graceful no-op |
| Desalineación con GA4 admin | nombres fijos desde `CONVERSION_EVENT_NAME_VALUES` |

## Threat model

### Superficie de ataque

- Cliente: `window.dataLayer`, cookies de consentimiento, `localStorage`, scripts GTM de terceros tras consentimiento.
- Red: `POST /api/eventos` (existente) invocado desde el navegador tras consentimiento.
- Parámetros URL: `utm_*`, `gclid` parseados en cliente.
- Componentes: banner/dialog manipulables en DevTools (esperado); no hay elevación de privilegio server-side desde el banner.

### Actores

- Visitante anónimo, bot automatizado, atacante que inyecta payloads en `dataLayer` o en `fetch` al endpoint público.

### Datos sensibles implicados

- No PII en eventos de conversión (solo slugs, métricas, IDs de sesión/GA anónimos).
- Query strings de URL pueden contener PII si el usuario las comparte; mitigación: `sanitizePageUrl` (origin + pathname).
- Cookies de consentimiento: preferencias, no identificadores personales.
- RGPD: base legal del consentimiento para analítica/marketing; registro de preferencias.

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Fuga de PII vía `pageUrl` o campos custom en dataLayer | URL con email en query; payload manual | Alto (RGPD) | `sanitizePageUrl`; schema `.strict()`; no aceptar claves extra en mirror |
| T2 | Tracking antes de consentimiento | GTM tags sin Consent Mode | Alto (legal) | Default `denied` v2; tests E2E de red |
| T3 | Abuso de `POST /api/eventos` desde cliente | Spam de eventos tras aceptar | Medio | Rate limit existente en GTK-32; sin bypass en `track` |
| T4 | XSS vía dataLayer | Inyección en campos string | Medio | Solo enums/slugs acotados por Zod; sin HTML en payloads |
| T5 | Manipulación de cookie de consentimiento | Usuario fuerza `granted` local | Bajo | Impacto limitado a su propio navegador; servidor no confía en cookie para authz |

**Descartadas:** IDOR en leads vía `leadId` en eventos — el endpoint ya valida UUID y degrada lead inexistente (GTK-32). Escalada RBAC — endpoint público sin sesión, solo ingesta anónima acotada por schema.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Con consentimiento por defecto, Vitest/E2E confirman que `pushDataLayer` no empuja eventos de conversión y `track` no llama a `/api/eventos`.
- [ ] SEC-2: Todo payload enviado a `/api/eventos` desde `track.ts` pasa `conversionEventSchema` (test unitario con mock `fetch`).
- [ ] SEC-3: `pageUrl` en dataLayer y en mirror usa `sanitizePageUrl` (sin query string).
- [ ] SEC-4: No se incluyen claves distintas a las de `conversionEventSchema` en el JSON del mirror (`.strict()`).
- [ ] SEC-5: E2E verifica ausencia de peticiones a dominios Google/marketing antes de aceptar cookies (cuando `NEXT_PUBLIC_GTM_ID` está definido en entorno de test).

## Open Questions

- TTL exacto de cookie de consentimiento (propuesta: 365 días; confirmar con Legal si difiere).
- Separación marketing vs analítica en UI del banner (mínimo: analítica + rechazar todo / aceptar todo).
