# Code review — gtk-46-gtm-consent-datalayer

- **Fecha:** 2026-07-25
- **Base:** `main..HEAD` (rama `feature/frontend-gtk-46-gtm-consent-datalayer`)

## Checklist

| Área | Estado |
|------|--------|
| Alineación OpenSpec / Linear | OK — reutiliza `conversionEventSchema`, Dialog/Button, sin contrato API nuevo |
| Capas Server/Client | OK — layout RSC; analytics en `'use client'` |
| RGPD / Consent Mode v2 | OK — default denied; GTM externo diferido |
| PII | OK — `sanitizePageUrl` en dataLayer y mirror |
| Tests unit + E2E | OK — 11 unit + 4 E2E |
| `frontend-standards.md` §11 | Actualizado |
| Security scan (`reports/security.md`) | Herencia SAST/SCA; 0 hallazgos nuevos en diff |

## Seguridad (SEC-1–5)

- SEC-1: `pushDataLayer` / `track` sin consentimiento → no emite / no fetch (tests).
- SEC-2/4: mirror validado con `conversionEventSchema`.
- SEC-3: query strip en `pageUrl`.
- SEC-5: E2E sin peticiones GTM antes de aceptar.

## Observaciones menores

- Botón flotante «Cookies» convive con barra inferior en primera visita (z-index documentado); GTK-47 puede reposicionar.
- `queueMicrotask` para visibilidad del banner evita regla eslint de setState síncrono en effect.

## Veredicto: APTO
