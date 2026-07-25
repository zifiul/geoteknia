# Informe N+3 — Playwright E2E

- **Fecha:** 2026-07-25
- **Change:** gtk-43-bootstrap-frontal
- **Label Linear:** `Frontend` — **E2E ejecutado** (no aplica omisión Backend).

## Comando

`pnpm run test:e2e` — **5 passed**

## Cobertura GTK-43

- Home `/` 200 sin errores de consola.
- Clase Tailwind `text-muted` en home.
- `/admin` con `request.get(..., { maxRedirects: 0 })` (evita bucle `/admin/login` sin página).

## Regresión GTK-24

- `gtk24-seguridad.spec.ts` actualizado a `request` + `maxRedirects: 0` por el mismo bucle de redirect.
