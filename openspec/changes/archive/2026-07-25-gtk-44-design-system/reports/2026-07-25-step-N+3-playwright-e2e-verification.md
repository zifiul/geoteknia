# Paso N+3 — E2E Playwright

- **Fecha:** 2026-07-25
- **Label Linear:** `Frontend` — **E2E ejecutado** (no omitido).

## Comando

`CI=true pnpm run test:e2e` — suite completa **10/10 OK**, incluye `gtk44-design-system-a11y.spec.ts`.

## Cobertura GTK-44

- Catálogo `/dev-componentes` 200
- Dialog: Enter, Escape, restauración de foco
- Accordion: teclado
- Tabs: flechas + roles ARIA
- axe: 0 violaciones critical/serious tras ajuste de contraste CTA (`--color-brand-accent` + `!text-white`)

## Recomendación local

Tras `build`, usar `CI=true` en E2E para evitar `reuseExistingServer` con instancia antigua en puerto 3010.
