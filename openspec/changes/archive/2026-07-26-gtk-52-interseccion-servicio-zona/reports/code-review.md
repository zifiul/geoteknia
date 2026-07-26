# Code review — gtk-52-interseccion-servicio-zona

## Alcance

Ruta `/servicios/[slug]/[zona]`, lectores `service-zone-pages`, organismos Stitch `intersection/`, tests unit/E2E.

## Checklist

- [x] Ruta anidada alineada con `lib/seo/silo-urls.ts` (no slug con guion).
- [x] Reutiliza `buildMetadata`, `buildServiceSchema`, breadcrumbs `service_zone_page`.
- [x] Sin cambios en `lib/seo/canonical.ts`.
- [x] Contenido único desde fila `service_zone_pages` (no concatena servicio+zona).
- [x] `notFound()` sin autogenerar intersecciones.
- [x] Mobile-first + `StickyCtaBar` (Stitch).
- [x] Security scan limpio (`reports/security.md`).

## Observaciones menores

- E2E de intersección publicada depende de datos CMS en BD (skip documentado).
- `eslint` global falla por issue preexistente en `TurnstileWidget.tsx` (fuera del diff GTK-52).

Veredicto: APTO
