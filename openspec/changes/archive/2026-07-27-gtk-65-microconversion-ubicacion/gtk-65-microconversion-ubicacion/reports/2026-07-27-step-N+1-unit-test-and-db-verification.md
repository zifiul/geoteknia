# Paso N+1 — unit + BD

Fecha: 2026-07-27

- `npm run test`: 522 tests OK (incl. GTK-65 validation + `location-lead-schema` GTK-29).
- Sin escritura en BD en tests unitarios del widget.
- QA DB GTK-29 (`tests/qa/gtk-29-db.qa.test.ts`) no re-ejecutado; endpoint sin cambios.
