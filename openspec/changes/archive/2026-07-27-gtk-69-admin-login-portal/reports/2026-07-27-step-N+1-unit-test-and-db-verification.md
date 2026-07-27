# QA — unit + BD (GTK-69)

**Fecha:** 2026-07-27

- `pnpm run test`: 541 tests unitarios OK (incl. `login-rate-limit`, `login-callback-url`, `login-form-validation`, middleware login path).
- Sin migraciones ni escrituras de negocio en esta US; seed E2E vía `tests/e2e/helpers/seed-gtk69-users.ts` (usuarios de prueba).
- BD: no se requiere restauración (solo upsert de usuarios E2E).
