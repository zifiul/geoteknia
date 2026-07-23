# Tasks — gtk-13-blog-categories-posts-services

> US: GTK-13 — Blog técnico: categorías, artículos y links a servicios | Variante: **Harness DB**
> Fases omitidas: contrato API (2), frontend (4b), TDD-RED (3 — schema puro), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/technical/data-model.md` §4.6 y descripción Linear GTK-13.
- [x] 0.2 Crear rama `feature/db-gtk-13-blog-categories-posts-services`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Schema Prisma blog

- [x] 1.1 Añadir modelos `BlogCategory`, `BlogPost` y `BlogPostService`.
- [x] 1.2 Añadir back-relations en `TeamMember` y `Service`.

## 2. Migración y cliente Prisma

- [x] 2.1 Ejecutar `npx prisma validate`.
- [x] 2.2 Crear y aplicar migración `blog_categories_posts_services`.
- [x] 2.3 Ejecutar `npx prisma generate`.

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Verificación BD: migración aplicada en Neon EU.
- [x] 3.3 Crear informe `openspec/changes/gtk-13-blog-categories-posts-services/reports/2026-07-23-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar que no se commitea `.env`.
- [x] 4.2 Crear `openspec/changes/gtk-13-blog-categories-posts-services/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Confirmar alineación con `docs/technical/data-model.md` §4.6.
- [x] 5.2 Delta spec `blog-categories-posts-services` creada en el change.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-13-blog-categories-posts-services/reports/code-review.md` con `Veredicto: APTO`.
