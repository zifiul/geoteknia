# Informe N+2 — curl (páginas)

- **Fecha:** 2026-07-25
- **Change:** gtk-43-bootstrap-frontal

## Nota

Sin API nueva; smoke de páginas equivalente verificado en fase E2E (servidor `next start` en puerto 3010 vía Playwright `webServer`).

## Resultados esperados (validados por E2E + build)

| Ruta | Comportamiento |
|------|----------------|
| `GET /` | HTTP 200, Tailwind activo |
| `GET /admin` | 307 a login (guard) con `maxRedirects: 0` |

## SEC-2

Metadata `robots` del layout `(admin)` verificada en `tests/unit/app/admin-layout-metadata.test.ts`.
