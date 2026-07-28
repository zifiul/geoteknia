# QA — gtk-70-crm-pipeline (N+1)

- `pnpm exec vitest run tests/unit/projects/board-utils.test.ts tests/unit/projects/project-queries.test.ts` — OK (7 tests)
- BD: sin escritura destructiva en unit tests (mocks)
- E2E: `tests/e2e/gtk-70-crm-pipeline.spec.ts` añadido (ejecutar con `DATABASE_URL` + seed GTK-69)
