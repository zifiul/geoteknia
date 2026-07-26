# Tasks — gtk-54-blog-listing

## Paso 0: rama de feature (OBLIGATORIO)

- [x] Rama `feature/frontend-gtk-54-blog-listing` creada y verificada.
- [x] `git status` revisado; trabajo limitado a GTK-54.

## Fase 1 — SDD

- [x] `proposal.md`, `design.md`, delta spec, este `tasks.md`.
- [ ] `openspec validate --strict --change gtk-54-blog-listing`.

## Gate 1 — revisión humana

- [ ] OK explícito sobre proposal + specs + design (threat model).

## Fase 2 — Contrato

- [x] Omitida — sin Route Handlers ni Server Actions nuevas.

## Fase 3 — TDD-RED

- [ ] Tests unitarios `tests/unit/content/gtk-54-blog-catalog.test.ts` en RED verificado.
- [ ] Tests E2E `tests/e2e/gtk-54-blog-listing.spec.ts` en RED verificado.

## Fase 4 — Implementación

- [ ] `lib/blog/catalog-config.ts` y helpers de query `page`.
- [ ] `listPublishedBlogCategories`, `getPublishedBlogCategoryBySlug`, `listPublishedBlogPostsByCategory` en `lib/content/blog-faqs.ts`.
- [ ] Organismos `ArticleCard`, `CategoryNav`, `BlogPagination`, vacío y tracker.
- [ ] Páginas `/blog` y `/blog/[categoria]` (+ `loading.tsx` / `error.tsx` si aplica).
- [ ] UI alineada con diseños Stitch del comentario Linear.

## Paso N: tests existentes

- [ ] Revisar tests de `blog-faqs` / SEO si aplica; sin regresiones.

## Paso N+1: unit + BD (OBLIGATORIO — agente)

- [ ] Ejecutar Vitest dirigido + suite acordada; informe `reports/YYYY-MM-DD-step-N+1-unit-test-and-db-verification.md`.
- [ ] Sin mutación BD persistente (solo mocks en unit).

## Paso N+2: curl

- [x] Omitido — sin endpoints HTTP nuevos.

## Paso N+3: E2E Playwright (OBLIGATORIO — Frontend)

- [ ] Ejecutar `tests/e2e/gtk-54-blog-listing.spec.ts`; informe en `reports/`.

## Fase 5b — Security scan

- [ ] `reports/security.md`.

## Fase 6 — Code review

- [ ] `reports/code-review.md` con `Veredicto: APTO`.

## Fase 7 — Docs

- [ ] Actualizar `docs/technical/frontend-standards.md` si procede (rutas blog listado).

## Gate 2 + Fase 8 — Archive

- [ ] OK humano final; `require-code-review.sh`; archive + sync specs.

## Decisión pendiente (PR)

- Sitemap: **no** incluir `/blog` ni categorías en este change (ver `proposal.md`).
