# Code review — gtk-58-licitaciones

- Fecha: 2026-07-26
- US: GTK-58

## Checklist

- [x] Lectores `listContractorClassifications` / `listPublicOrganismExperience` con `deletedAt: null` y caso solo si publicado.
- [x] Opción A documentada: seed `tenders-seed-data.ts` + `seedTendersMasters` sin CRUD admin.
- [x] Formulario usa `tenderLeadSchema` y `POST /api/leads/licitacion` (no `/api/licitaciones`).
- [x] Turnstile cliente + validación servidor heredada; errores 400/403/429 accesibles.
- [x] SEO: metadata estática, breadcrumbs JSON-LD, enlace `/acreditaciones`.
- [x] UI alineada con Stitch (hero obra pública, tablas, formulario lateral/stack).
- [x] Tests unitarios (4) y E2E (4) en verde tras `next build`.
- [x] `reports/security.md` sin bloqueantes en el diff.

## Seguridad

- Threat model: XSS/PII/spam cubiertos por React escape, endpoint existente y Turnstile.
- `pushRawDataLayer` para `form_start`/`form_step` sin PII.

## Observaciones

- Relación Linear GTK-58↔GTK-59: documentar en PR (enlace a `/acreditaciones` sin página hasta GTK-59).
- Ejecutar `npx prisma db seed` en entornos sin datos de masters.

Veredicto: APTO
