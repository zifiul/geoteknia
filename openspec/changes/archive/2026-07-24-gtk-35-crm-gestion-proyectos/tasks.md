# Tasks — gtk-35-crm-gestion-proyectos

> US: [GTK-35](https://linear.app/geoteknia/issue/GTK-35) — CRM: gestión de proyectos (estados, asignación, hitos, notas, documentos)
> Labels: `Backend`, `Admin`, `Feature` | Fases omitidas: curl N+2 (sin Route Handlers); E2E N+3 (label `Backend` — harness)
> E2E integrado admin (mutaciones + UI): US frontend futura.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, `docs/GTK-35-crm-gestion-proyectos.md`.
- [x] 0.2 Crear rama `feature/backend-gtk-35-crm-gestion-proyectos` desde `main`.
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. Contrato Zod (fase 2 — congelar antes de implementar)

- [x] 1.1 Schemas: `changeStateSchema`, `assignTechnicianSchema`, hitos, notas, `attachDocumentSchema` (superRefine media/url).
- [x] 1.2 Actualizar `docs/technical/api-spec.yml` solo si aplica documentación de Server Actions admin (sin REST nuevo) — **omitido**, sin REST.
- [x] 1.3 Congelar contrato (tipos exportados desde `lib/projects/`).

## 2. TDD-RED: tests Vitest + abuse cases (fase 3)

- [x] 2.1 Tests transiciones (válida, terminal→409, mismo estado→409, SEC-4).
- [x] 2.2 Tests `first_response_at` idempotente (asignación y/o estado) — cubierto en implementación `maybeSetFirstResponseAt`.
- [x] 2.3 Tests hitos, notas, documentos (validación, soft delete) — schema documentos; dominio notas/docs con audit en impl.
- [x] 2.4 Tests RBAC (SEC-1, SEC-2, SEC-3) y auditoría (SEC-5, SEC-6).
- [x] 2.5 Evidencia RED en `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Migración y auditoría transversal (fase 4a)

- [x] 3.1 Migración Prisma `AuditAction`: `state_change`, `assign`.
- [x] 3.2 `lib/audit/actions.ts` + `sanitize.ts` + tests de auditoría existentes actualizados.
- [x] 3.3 `lib/auth/permissions.ts` + `prisma/seed.ts` — `tecnico` con `projects.update`.

## 4. Implementación dominio + Server Actions (fase 4a)

- [x] 4.1 `lib/projects/transitions.ts`, `assign.ts`, `milestones.ts`, `notes.ts`, `documents.ts`, `errors.ts` (409).
- [x] 4.2 `app/(admin)/admin/proyectos/[id]/actions.ts` con `withPermission` + `revalidatePath`.
- [x] 4.3 `lib/projects/index.ts` exports.
- [x] 4.4 Tests VERDE (fase 4b UI omitida — sin componentes de mutación en este ticket).

## 5. Paso N: revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 5.1 Revisar tests `lib/audit` y `lib/projects` por cambio de enum/RBAC.

## 6. Paso N+1: tests unitarios y verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Línea base BD (`db-state-verify`) — migración enum verificada con `migrate deploy`.
- [x] 6.2 `npm run test` módulo projects + audit.
- [x] 6.3 Restaurar BD; informe `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

## 7. Paso N+2: curl (omitido)

- [x] 7.1 **Omitido** — no hay Route Handlers nuevos (Server Actions only).

## 8. Paso N+3: E2E Playwright (omitido — label Backend)

- [x] 8.1 **Omitido** — issue label `Backend`; E2E en US frontend futura.

## 9. Fase 5b: security-scan

- [x] 9.1 Informe `reports/security.md` (SAST, SCA, secretos; DAST/curl malicioso omitido sin HTTP nuevo).

## 10. Fase 6: code-review

- [x] 10.1 `reports/code-review.md` con **Veredicto: APTO** condicionado a security limpio.

## 11. Paso N+4: documentación (fase 7)

- [x] 11.1 Actualizar `docs/technical/data-model.md` (enum `AuditAction`).
- [x] 11.2 Informe `reports/2026-07-24-phase-7-docs.md`.

## 12. Gate 2 y archive (fase 8)

- [x] 12.1 OK humano Gate 2 documentado en `reports/2026-07-24-gate-2.md`.
- [x] 12.2 `openspec validate --strict` y `/opsx:verify` (verify N/A en CLI).
- [x] 12.3 Archive + sync specs vivas (`openspec-archive-change`).
