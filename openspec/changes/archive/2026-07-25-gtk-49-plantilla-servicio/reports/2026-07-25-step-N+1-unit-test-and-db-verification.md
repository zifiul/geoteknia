# QA — GTK-49 (fase 5a)

## N+1 — Vitest + BD

- `npm run test`: 410 passed (incl. `gtk-49-published-reads`, `jsonld` extendido).
- Sin escritura en BD en tests unitarios; `db-state-verify` no requerido.

## N+2 — curl

- Omitido: sin Route Handlers nuevos.

## N+3 — Playwright

- `npm run test:e2e -- tests/e2e/gtk49-service-page.spec.ts`: 2 passed, 2 skipped (sin servicios publicados en BD local).
- 404 de slug inexistente verificado.

## Build

- `npm run build`: OK — rutas `/servicios`, `/servicios/[slug]` (SSG).

## Manual pendiente (DoD ticket)

- Rich Results Test con servicio publicado en entorno con datos CMS.
- ISR on-demand al publicar/despublicar (GTK-40, no reimplementado).

## Lighthouse CI

- Fuera de alcance GTK-49 (GTK-77).
