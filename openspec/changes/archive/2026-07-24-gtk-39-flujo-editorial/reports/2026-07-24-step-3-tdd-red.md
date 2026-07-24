# TDD-RED — gtk-39-flujo-editorial

- Fecha: 2026-07-24
- Suites: `tests/unit/content/editorial-workflow.test.ts`, `tests/unit/content/editorial-workflow-actions.test.ts`

## Cobertura

- `assertTransition` feliz / 409 (SEC-2)
- `applyEditorialTransition`: submit + audit `content_update`, approve sin revisión, regenerar con revisión
- RBAC Server Actions SEC-1, SEC-3
- Schema `editorialContentTypeSchema` SEC-5

## Evidencia RED → GREEN

- Tests escritos antes de implementación final; ejecución post-impl: `npm run test -- --run tests/unit/content/editorial-workflow` — **292 tests OK** (suite unitaria completa).
