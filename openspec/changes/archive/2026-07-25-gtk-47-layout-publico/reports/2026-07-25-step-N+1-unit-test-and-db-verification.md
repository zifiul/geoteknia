# Unit tests + BD — gtk-47-layout-publico

- **Fecha:** 2026-07-25
- **Vitest:** `pnpm run test` — 88 archivos, 378 tests OK.
- **Typecheck:** `pnpm run typecheck` OK.
- **BD:** solo lectura (`getOrganizationProfile` / `getGeneralContactChannel`); sin escrituras en tests → **db-state-verify N/A**.
