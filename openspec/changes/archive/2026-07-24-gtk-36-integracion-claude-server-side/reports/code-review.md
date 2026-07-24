# Code review — gtk-36-integracion-claude-server-side

Fecha: 2026-07-24

## Alcance

- `lib/ia/client.ts`, `models.ts`, `generate.ts`, `token-usage.ts`, `errors.ts`, `index.ts`
- `lib/env.ts`, `.env.example`
- Tests `tests/unit/ia/*`, `tests/qa/gtk-36-db.qa.test.ts`
- `docs/technical/backend-standards.md` §9

## Checklist

- [x] Capas y `server-only` en integración Claude
- [x] Sin sampling prohibido en modelos 4.6+/Opus 4.8
- [x] Degradación elegante (`GenerationResult` discriminated union)
- [x] Única fuente de `cost_eur` en `computeCostEur`
- [x] Threat model SEC-1..SEC-3 con tests
- [x] `reports/security.md` sin bloqueantes

## Observaciones menores

- QA BD pendiente de ejecutar con Neon accesible.
- Gate 1 humano aún **PENDIENTE** en `reports/2026-07-24-gate-1.md`.

**Veredicto: APTO**
