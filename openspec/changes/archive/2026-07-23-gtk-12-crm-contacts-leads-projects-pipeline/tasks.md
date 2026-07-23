# Tasks — gtk-12-crm-contacts-leads-projects-pipeline

> US: GTK-12 — CRM ligero: contactos, leads, proyectos y pipeline | Variante: **Harness DB**
> Fases omitidas: contrato API (2), frontend (4b), TDD-RED (3 — schema puro), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/technical/data-model.md` §4.10 y descripción Linear GTK-12.
- [x] 0.2 Crear rama `feature/db-gtk-12-crm-contacts-leads-projects-pipeline`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Schema Prisma CRM

- [x] 1.1 Añadir enums `LeadType`, `LeadChannel`, `LeadSource`, `MilestoneStatus`, `ProjectDocType`.
- [x] 1.2 Añadir modelos `Contact`, `Lead`, `ProjectState`, `Project`, `ProjectStateHistory`, `ProjectMilestone`, `ProjectNote`, `ProjectDocument`.
- [x] 1.3 Cerrar relación `CaseStudy.sourceProject` → `Project`.
- [x] 1.4 Añadir back-relations en `Province`, `Service`, `WorkTypology`, `LeadMagnet` y `User`.

## 2. Migración y cliente Prisma

- [x] 2.1 Ejecutar `npx prisma validate`.
- [x] 2.2 Crear y aplicar migración `crm_contacts_leads_projects_pipeline`.
- [x] 2.3 Ejecutar `npx prisma generate`.

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Verificación BD: migración aplicada en Neon EU.
- [x] 3.3 Crear informe `openspec/changes/gtk-12-crm-contacts-leads-projects-pipeline/reports/2026-07-23-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar que no se commitea `.env`.
- [x] 4.2 Crear `openspec/changes/gtk-12-crm-contacts-leads-projects-pipeline/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Confirmar alineación con `docs/technical/data-model.md` §4.10.
- [x] 5.2 Delta spec `crm-contacts-leads-projects-pipeline` creada en el change.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-12-crm-contacts-leads-projects-pipeline/reports/code-review.md` con `Veredicto: APTO`.
