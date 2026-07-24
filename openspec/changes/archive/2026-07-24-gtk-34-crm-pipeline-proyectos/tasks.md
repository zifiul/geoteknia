# Tasks — gtk-34-crm-pipeline-proyectos



> US: [GTK-34](https://linear.app/geoteknia/issue/GTK-34) — CRM: pipeline de proyectos (listado, detalle y filtros)

> Labels: `Backend`, `Admin`, `Feature` | Fases omitidas: curl N+2 (sin Route Handlers); E2E N+3 (label `Backend` — harness)

> E2E integrado admin: US frontend futura (documentar identificador cuando exista en Linear).



## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)



- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/backend-standards.md`, `docs/technical/frontend-standards.md` (RSC, `/admin`).

- [x] 0.2 Crear rama `feature/backend-gtk-34-crm-pipeline-proyectos` desde `main`.

- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.

- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.



## 1. Contrato Zod (fase 2 — congelar antes de implementar)



- [x] 1.1 Definir `projectFiltersSchema` en `lib/projects/project-filters-schema.ts` (`.strict()`, `pageSize` max 100).

- [x] 1.2 Sin cambios en `docs/technical/api-spec.yml` (lecturas RSC, sin HTTP público).



## 2. TDD-RED: tests Vitest (fase 3)



- [x] 2.1 Tests `buildProjectListWhere` (SEC-2).

- [x] 2.2 Tests `projectFiltersSchema` (SEC-4).

- [x] 2.3 Tests `getPipelineMetrics`.

- [x] 2.4 Tests `getProjectDetail` (SEC-3, SEC-5).

- [x] 2.5 Tests RBAC listado (SEC-1).

- [x] 2.6 Evidencia en `reports/2026-07-24-step-2-tdd-red.md`.



## 3. Implementación backend — lib/projects (fase 4a)



- [x] 3.1 `lib/projects/queries.ts`, `project-list-where.ts`.

- [x] 3.2 `lib/projects/metrics.ts` con `$queryRaw` parametrizado.

- [x] 3.3 `lib/projects/index.ts` exports.

- [x] 3.4 Tests VERDE.



## 4. Implementación frontend — admin (fase 4b)



- [x] 4.1 `app/(admin)/admin/proyectos/page.tsx` (ruta `/admin/proyectos`).

- [x] 4.2 `app/(admin)/admin/proyectos/[id]/page.tsx`.

- [x] 4.3 Filtros vía formulario GET (sin client components extra).

- [x] 4.4 `lib/admin/portal-page-errors.ts`, `/admin/forbidden`, `notFound()` en detalle.



## 5. Revisar y actualizar tests existentes (OBLIGATORIO)



- [x] 5.1 Suite unit completa en verde (sin regresión en `create-project-from-lead` / RBAC).

- [x] 5.2 Tests GTK-34 añadidos.



## 6. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)



- [x] 6.1 Sin mutación BD en tests mockeados (documentado).

- [x] 6.2 `npm run test` — PASS.

- [x] 6.3 Solo lectura en implementación.

- [x] 6.4 `reports/2026-07-24-step-N+1-unit-test-and-db-verification.md`.

- [x] 6.5 `npm run lint` — PASS.



## 7. Pruebas manuales con curl — OMITIDA (documentado)



> No aplica: GTK-34 no crea ni modifica Route Handlers.



## 8. E2E Playwright MCP — OMITIDO (label `Backend`)



- [x] 8.1 **Omitido — issue label `Backend`**. Flujo visual `/admin/proyectos`: US frontend futura.



## 9. Actualizar documentación técnica (OBLIGATORIO)



- [x] 9.1 `docs/technical/backend-standards.md` §8.3 (scoping GTK-34).

- [x] 9.2 `data-model.md`: sin cambios de schema.

- [x] 9.3 `api-spec.yml`: sin cambios.

- [x] 9.4 `reports/2026-07-24-phase-7-docs.md`.



## 10. Code review, security scan y archive (fases 5b–8)



- [x] 10.1 `reports/security.md`.

- [x] 10.2 `reports/code-review.md` — `Veredicto: APTO`.

- [x] 10.3 `openspec validate gtk-34-crm-pipeline-proyectos --strict` — válido.

- [x] 10.4 Informe APTO verificado (`grep` en `code-review.md`; script bash falló por CRLF en Windows).

- [x] 10.5 Archive + specs sincronizadas (Gate 2 OK 2026-07-24).

