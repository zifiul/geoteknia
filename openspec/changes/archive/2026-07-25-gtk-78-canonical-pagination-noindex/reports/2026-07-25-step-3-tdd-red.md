# TDD-RED — gtk-78-canonical-pagination-noindex

- **Fecha:** 2026-07-25
- **Suites nuevas:** `canonical.test.ts`, `robots-rules.test.ts`, `gtk-78-seo-regression.test.ts`, `gtk78-canonical-lab.spec.ts`

## Evidencia RED (pre-implementación)

Tests añadidos contra módulos inexistentes (`@/lib/seo/canonical`, `@/lib/seo/robots-rules`) → fallo de resolución de módulo / import antes de implementar `lib/seo/canonical.ts` y `robots-rules.ts`.

## Evidencia GREEN (post-implementación)

```
pnpm exec vitest run tests/unit/seo/canonical.test.ts tests/unit/seo/robots-rules.test.ts tests/unit/seo/gtk-78-seo-regression.test.ts
→ 18 passed
```

Abuse cases SEO: SEC-1 `basePath` con origen rechazado; regresión admin/sitemap sin reimplementar GTK-42/43.
