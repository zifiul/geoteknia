# Proposal — gtk-34-crm-pipeline-proyectos

> US: [GTK-34 — CRM: pipeline de proyectos (listado, detalle y filtros)](https://linear.app/geoteknia/issue/GTK-34/crm-pipeline-de-proyectos-listado-detalle-y-filtros)
> Labels: `Backend`, `Admin`, `Feature` | Dependencias: GTK-25 (RBAC, ✅), GTK-23 (sesión, ✅), modelo `Project` (GTK-12, ✅) | Desbloquea: vistas admin de escritura, reporting avanzado, E2E integrado (US frontend futura)

## Why

El back-office `/admin` necesita la primera capa de **lectura** del CRM: pipeline de proyectos paginado y filtrable, ficha de detalle con relaciones y métricas básicas del pipeline (por servicio/zona, cualificación, tiempo medio de primera respuesta). Sin esto no hay visibilidad del cumplimiento del SLA de primera respuesta (<48 h) ni control operativo por rol. Materializa RF-18, US-15 y RNF-ADMIN; es el primer consumidor real de `requirePermission` / scoping de GTK-25 sobre datos con PII de clientes.

## What Changes

- Crear `lib/projects/queries.ts` con `projectFiltersSchema`, `listProjects(filters)` y `getProjectDetail(id)` — sesión + `projects.read`, scoping en `where` para `tecnico`, `assertOwnership` en detalle, exclusión de `deleted_at`.
- Crear `lib/projects/metrics.ts` con `getPipelineMetrics(filters)` — mismas reglas de scoping; agregaciones `groupBy`; tasa de cualificación; tiempo medio vía `$queryRaw` parametrizado (null sin datos / sin write-path de `first_response_at`).
- Crear `app/(admin)/proyectos/page.tsx` (listado + filtros por search params, Server Component) y `app/(admin)/proyectos/[id]/page.tsx` (detalle).
- Modificar `lib/projects/index.ts` para exportar queries y métricas.
- Tests Vitest (unitarios: construcción de `where`, scoping, métricas; integración: detalle, RBAC, soft delete).
- **Sin** Route Handlers públicos ni envelope `apiSuccess`/`apiError` — lecturas internas desde RSC.
- QA: unit + verificación BD; **sin E2E Playwright** (label `Backend` — harness); **sin curl N+2** (no hay endpoints HTTP nuevos). E2E del flujo admin: US frontend futura acordada en `tasks.md`.

## Capabilities

### New Capabilities

- `admin-crm-projects-pipeline`: lectura del pipeline de proyectos en `/admin` (listado, detalle, filtros, métricas) con RBAC `projects.read` y scoping por rol.

### Modified Capabilities

- `crm-contacts-leads-projects-pipeline`: añadir requisitos de comportamiento de lectura en portal (no cambia el schema Prisma).

## Impact

- **Código:** `lib/projects/queries.ts`, `lib/projects/metrics.ts`, `lib/projects/index.ts`, `app/(admin)/proyectos/**`, tests en `tests/unit/projects/**` y `tests/integration/projects/**` (rutas según convención del repo).
- **BD:** solo lectura; sin migraciones. Métrica de tiempo de respuesta depende de otro ticket para poblar `first_response_at`.
- **API:** ningún cambio en `docs/technical/api-spec.yml` (sin Route Handlers).
- **Contrato Zod:** `projectFiltersSchema` en `lib/projects/` (fase 2 — schemas compartidos, sin OpenAPI).
- **RGPD/PII:** contacto/lead en portal autenticado; fallo de scoping expone PII — riesgo crítico; no logs con filas completas ni prompts Claude.
- **SEO:** sin impacto (rutas `/admin` noindex).

## Fuera de alcance

- Mutaciones de proyecto (estados, notas, documentos, asignación) — tickets de escritura futuros.
- Route Handlers o API JSON para consumo externo.
- Poblado de `first_response_at` (write-path en otro ticket).
- Conteo de leads no convertidos en tabla `leads` (métricas sobre `projects` del pipeline; ver `design.md` Hallazgo 7).
- E2E Playwright en este ticket (label `Backend`).
- Audit log en lecturas (exportación futura sí registraría `export`).
