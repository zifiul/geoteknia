# Code review — GTK-55 (2026-07-26)

## Alcance

Plantilla `/blog/[categoria]/[slug]`, lectores públicos, sanitización CMS, JSON-LD `Article` extendido, organismos Stitch.

## Checklist

- [x] `PUBLISHED_EDITORIAL_WHERE` en lectores; 404 unificado
- [x] Sin reimplementación de `buildMetadata` / breadcrumbs
- [x] XSS: sanitización server-only antes de render
- [x] Autor oculto si perfil no publicado
- [x] Tests unitarios y E2E mínimos en verde
- [x] `reports/security.md` revisado

## Seguridad

Sanitización explícita; TOC sin reparse de HTML; sin PII en cliente adicional.

**Veredicto: APTO**
