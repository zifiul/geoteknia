# N+3 — Playwright E2E — gtk-46

- **Fecha:** 2026-07-25
- **Comando:** `pnpm exec playwright test gtk46-consent-datalayer`
- **Resultado:** 4/4 OK

## Casos

1. Sin consentimiento → 0 peticiones a `googletagmanager.com` (GTM diferido hasta opt-in).
2. Aceptar → `dataLayer` con `event: consent_update`.
3. Teclado entre Rechazar / Configurar / Aceptar en el banner.
4. Tras aceptar, botón de prueba → `POST /api/eventos` con `eventName: scroll_depth`.

**E2E ejecutado — issue labels `Frontend` + `CHORE`.**
