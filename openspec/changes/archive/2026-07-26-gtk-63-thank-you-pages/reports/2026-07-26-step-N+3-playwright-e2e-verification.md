# QA — gtk-63-thank-you-pages (fase 5a)

## N+1 — Vitest + BD

- `npm run test`: **427** tests OK.
- Escritura BD: **no aplica** (páginas read-only).

## N+2 — curl

**Omitido** — sin Route Handlers nuevos.

## N+3 — Playwright E2E

- Spec: `tests/e2e/gtk63-thank-you.spec.ts`
- Resultado: **8/8 passed** (servidor `next start` puerto 3010, `CI=true` tras build).
- Label `Frontend`: E2E **no omitido**.

## Manual sugerido

- Inspeccionar `meta robots` en cada `/gracias/{tipo}?ref=PRE-...`
- Confirmar layout vs pantallas Stitch (proyecto `9787207935189076711`).
