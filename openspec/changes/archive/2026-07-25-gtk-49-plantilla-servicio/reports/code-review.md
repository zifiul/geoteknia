# Code review — GTK-49

## Checklist

- [x] Reutiliza `PUBLISHED_EDITORIAL_WHERE`, `buildMetadata`, `listPublishedServices`, breadcrumbs/FAQ JSON-LD existentes.
- [x] Sin duplicar revalidación ISR (GTK-40).
- [x] UI mobile-first + Stitch (hero, secciones, sticky CTA).
- [x] Tests unitarios y E2E añadidos; typecheck/lint/build OK.
- [x] `reports/security.md` sin bloqueantes.

## Seguridad

- Threat model en `design.md` cubierto en implementación (404 borradores, sin HTML crudo del CMS).

## Notas

- Maquinaria filtrada por `PUBLISHED_EDITORIAL_WHERE` (schema real con bloque editorial; ticket mencionaba `is_active` obsoleto).
- E2E de detalle skipped sin seed de servicios publicados en BD local.

**Veredicto: APTO**
