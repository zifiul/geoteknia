# Code review — gtk-56-equipo-tecnico

## Alcance

Directorio `/equipo`, fichas SSG `/equipo/[slug]`, lectores públicos, metadata sintética Person, organismos Stitch, JSON-LD y tracking dataLayer.

## Checklist

- [x] Reutiliza `buildPersonSchema`, breadcrumbs `team_member`, `PUBLISHED_EDITORIAL_WHERE`.
- [x] `buildTeamMemberSeoBlock`: `schemaType Person`, `noindex: false`, sin leer SEO inexistente en BD.
- [x] Colegiación visible si existe (decisión gap 5 en `design.md`).
- [x] `listPublishedCaseStudiesByTeamMember` vía tabla puente; sección proyectos oculta si vacía.
- [x] Mobile-first grid 1/2/3; un `h1` en ficha; `alt` en retratos.
- [x] Tests unitarios GTK-56 + E2E (build previo / `CI=true` para servidor fresco).
- [x] `reports/security.md` limpio para el diff.

## Seguridad

Ver `reports/security.md`.

**Veredicto: APTO**
