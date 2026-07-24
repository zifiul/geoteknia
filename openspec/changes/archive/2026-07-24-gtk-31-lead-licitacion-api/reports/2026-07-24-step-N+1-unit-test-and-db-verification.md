# Informe Step N+1 — unit tests + verificación BD

- Fecha: 2026-07-24
- Change: gtk-31-lead-licitacion-api

## Vitest

```
npx vitest run tests/unit/leads/tender-lead-schema.test.ts \
  tests/unit/leads/create-tender-lead.test.ts \
  tests/unit/projects/create-project-from-lead.test.ts \
  tests/unit/api/leads-licitacion.test.ts \
  tests/qa/gtk-31-db.qa.test.ts
```

Resultado: **5 files, 15 tests PASS**

## Regresión GTK-28/29

```
npx vitest run tests/unit/leads tests/unit/api/leads-presupuesto.test.ts tests/unit/api/leads-ubicacion.test.ts
```

Resultado: **10 files, 47 tests PASS**

## db-state-verify (`tests/qa/gtk-31-db.qa.test.ts`)

- Baseline capturado en `beforeAll` (contacts, leads, projects, conversion_events).
- Alta `createTenderLead` con `GTK31-QA-EXP` e `importeEstimado: 50000`.
- Verificado: `lead_type=licitacion`, `expediente_ref` y `estimated_value` en lead y project, prefijo `LIC-`.
- Limpieza en `afterAll` (lead, project, events, contact de prueba).

## Resultado

**PASS**
