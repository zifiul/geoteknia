# Code review — gtk-59-acreditaciones

- Fecha: 2026-07-26
- US: GTK-59

## Checklist

- [x] `listPublishedAccreditationsDetailed()` con `PUBLISHED_EDITORIAL_WHERE` + vigencia `validUntil`.
- [x] `listActiveAccreditations()` sin cambios (Home GTK-48).
- [x] Clasificación contratista como credencial, sin tabla `contractor_classifications` (GTK-58).
- [x] JSON-LD `Organization`/`hasCredential` + `BreadcrumbList`.
- [x] Metadata estática, canonical `/acreditaciones`, ISR 3600.
- [x] UI Stitch: hero, tarjetas por categoría, CTA licitaciones (sin tabla CPV del mock).
- [x] `select_content` en verificación y CTA.
- [x] Tests unitarios (4) y E2E (4) en verde tras `next build`.
- [x] `reports/security.md` sin bloqueantes en el diff.

## Seguridad

- Threat model: XSS/open redirect mitigados; solo lectura pública.

## Observaciones

- Lanzamiento con datos reales requiere alta de filas en CRUD acreditaciones (contenido).
- Añadir `CredentialType` a `data-model.md` en ticket de docs aparte (gap conocido).

Veredicto: APTO
