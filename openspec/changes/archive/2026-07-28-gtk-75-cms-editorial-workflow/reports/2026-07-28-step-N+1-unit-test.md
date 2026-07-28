# QA N+1 — GTK-75 (2026-07-28)

- `pnpm exec vitest run tests/unit/content/content-revisions-list.test.ts tests/unit/content/schedule-publication.test.ts` — OK
- `pnpm exec tsc --noEmit` — OK
- Escritura `scheduledPublishAt`: cubierta en unit tests con mocks (sin mutación Neon en CI local)

E2E: `tests/e2e/gtk-75-cms-editorial-workflow.spec.ts` (smoke panel workflow; ejecución completa requiere seed GTK-69 + filas CMS).
