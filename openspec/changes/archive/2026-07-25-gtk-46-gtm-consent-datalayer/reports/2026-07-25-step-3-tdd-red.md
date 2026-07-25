# TDD-RED — gtk-46-gtm-consent-datalayer

- **Fecha:** 2026-07-25
- **Suites:** `tests/unit/analytics/{consent,datalayer,track,attribution}.test.ts`, `tests/e2e/gtk46-consent-datalayer.spec.ts`

## Evidencia RED (fase 3)

Tests añadidos antes de implementación; primera ejecución falló por módulos inexistentes (`consent`, `datalayer`, `track`, componentes).

## Evidencia GREEN (fase 4)

```
pnpm exec vitest run tests/unit/analytics/consent.test.ts tests/unit/analytics/datalayer.test.ts tests/unit/analytics/track.test.ts tests/unit/analytics/attribution.test.ts
→ 4 files, 11 passed

pnpm exec playwright test gtk46-consent-datalayer
→ 4 passed
```

Abuse cases cubiertos en unit: SEC-1 (sin consent → sin dataLayer/fetch), SEC-2/4 (schema strict en mirror).
