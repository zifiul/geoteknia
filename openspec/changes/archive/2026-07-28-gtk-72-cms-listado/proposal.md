# Proposal — gtk-72-cms-listado

**Linear:** [GTK-72](https://linear.app/geoteknia/issue/GTK-72/cms-listado-de-contenido-por-tipo-estado-y-silo) — CMS: listado de contenido por tipo, estado y silo.

## Qué y por qué

Punto de entrada editorial en `/contenido` para las 8 entidades con flujo GTK-39/41: filtros en URL, tabla paginada, métricas de workflow y menú crear (enlace al editor GTK-73). Sustituye el stopgap `findCmsQuickEditHref()` del dashboard GTK-79.

## Alcance

- `lib/admin/cms-content-types.ts`, `cms-content-queries.ts`, `cms-filters-schema.ts`
- RSC `app/(admin)/(portal)/contenido/page.tsx` + `loading.tsx`
- Organismos `components/organisms/admin/cms/*`
- Dashboard: enlaces reales a `/contenido`
- Tests unitarios + E2E Playwright
- **Fuera de alcance:** extender `accreditation`/`lead_magnet` al registro editorial (ticket de seguimiento); editor GTK-73

## Stitch (comentario Linear 2026-07-20)

Proyecto `14512274866174259595`, pantallas: listado `b0159f2b…`, vacío `a8da5b4e…`, solo lectura técnico `263a2d52…`, skeleton `a63ce026…`.

## Impacto

Sin migración Prisma ni Route Handlers nuevos. Contrato: schemas Zod de filtros (fase 2). RBAC existente `content.read` / `content.create`.
