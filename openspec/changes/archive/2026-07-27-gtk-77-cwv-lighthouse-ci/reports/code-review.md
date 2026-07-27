# Code review — gtk-77-cwv-lighthouse-ci

**Fecha:** 2026-07-27  
**US:** GTK-77

## Alcance revisado

- Gate LHCI real (`error`), URLs Fase 1, `budget.json`, workflow GitHub Actions.
- Seed público mínimo para CI/E2E (`prisma/seed-lighthouse-public.ts`, hero en `public/images/`).
- Tests unitarios + E2E CWV/GTM.
- Ajuste `playwright.config.ts` (origen media/site en puerto 3010).
- Docs `frontend-standards.md` §10.3.

## Seguridad

- Alineado con `reports/security.md` (SEC-1 workflow sin Neon prod).

## Observaciones menores

- Home E2E puede omitirse si el HTML estático se generó antes del seed; en CI (seed → build → LHCI) el hero debe estar presente.
- Fase 2: ampliar `lighthouse-phase1.cjs` con geo/caso (GTK-51/53).

**Veredicto: APTO**
