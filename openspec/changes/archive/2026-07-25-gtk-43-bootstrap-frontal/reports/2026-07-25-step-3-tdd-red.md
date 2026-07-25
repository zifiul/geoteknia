# Informe Step 3 — TDD-RED

- **Fecha:** 2026-07-25
- **Change:** gtk-43-bootstrap-frontal

## Suites añadidas

- `tests/unit/seo/site-url.test.ts` — falló con `Cannot find package '@/lib/seo/site-url'` antes de implementar.
- `tests/e2e/gtk43-front-bootstrap.spec.ts` — añadida en RED (fallos esperados en rutas admin hasta ajuste de `maxRedirects`).

## Evidencia RED (Vitest)

```
Error: Cannot find package '@/lib/seo/site-url' imported from tests/unit/seo/site-url.test.ts
```

## Estado tras implementación

- Vitest: **327 tests PASS** (incl. `site-url` y `admin-layout-metadata`).
