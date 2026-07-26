# TDD-RED — gtk-63-thank-you-pages (2026-07-26)

Tests añadidos antes de implementación (fase 3):

- `tests/unit/thankyou/sanitize.test.ts` — SEC-TY2 abuse cases en `download`.
- `tests/unit/thankyou/thank-you-confirmation.test.tsx` — copy compartido, ref, descarga.
- `tests/unit/thankyou/conversion-ping.test.tsx` — sessionStorage anti-doble disparo.
- `tests/e2e/gtk63-thank-you.spec.ts` — noindex, ref, robots.txt, dataLayer.

**RED verificado:** suites fallaban con 404 / componentes ausentes antes de fase 4.

**VERDE:** `npm run test` 427 passed; E2E GTK-63 8 passed (`CI=true` tras `npm run build`).
