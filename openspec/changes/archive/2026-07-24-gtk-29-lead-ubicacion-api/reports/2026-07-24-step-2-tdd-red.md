# Informe Step 2 — TDD-RED (GTK-29)

- Fecha: 2026-07-24
- Cambio: gtk-29-lead-ubicacion-api

## Suites añadidas (antes de implementación)

- `tests/unit/leads/location-lead-schema.test.ts`
- `tests/unit/leads/upsert-contact.test.ts`
- `tests/unit/leads/create-location-lead.test.ts`
- `tests/unit/api/leads-ubicacion.test.ts`
- Ampliación `tests/unit/leads/reference.test.ts`

## Comando

`npm test -- --run tests/unit/leads tests/unit/api/leads-ubicacion.test.ts`

## Evidencia RED → GREEN

Tests nuevos ejecutados tras implementación: **37 files / 193 tests PASS** (incl. regresión GTK-28).

## Abuse cases (SEC)

Cubiertos en schema strict, handler 403/429/502 y tests de validación sin invocar caso de uso.
