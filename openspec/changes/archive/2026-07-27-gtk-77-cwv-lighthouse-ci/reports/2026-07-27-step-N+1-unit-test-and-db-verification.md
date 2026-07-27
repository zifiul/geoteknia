# N+1 — gtk-77-cwv-lighthouse-ci

**Fecha:** 2026-07-27

- `pnpm run test`: 527+ tests unitarios OK (incl. GTK-77 config).
- Seed `seedLighthousePublicFixtures`: escritura idempotente en BD; sin restauración adicional (upsert por slug, sin borrado de datos de usuario).
