# Code review — gtk-51-geo-landing-zona

## Alcance

Plantilla `/zonas`, lectores `geo-zones`, organismos Stitch, tests unit/E2E.

## Checklist

- [x] Reutiliza `buildMetadata`, breadcrumbs, ISR GTK-40.
- [x] Sin JSON-LD `LocalBusiness` duplicado por zona.
- [x] Sin aviso `word_count` en público.
- [x] Cobertura servicios prefiere `service_zone_page`.
- [x] Mobile-first + `StickyCtaBar` en CTA presupuesto.
- [x] Security scan limpio (`reports/security.md`).

## Observaciones menores

- E2E de zona publicada se omite si no hay geo-zonas en BD (patrón GTK-49).
- Tras cambios de rutas, ejecutar `npm run build` antes de E2E local (Playwright usa `next start`).

Veredicto: APTO
