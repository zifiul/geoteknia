# Design — gtk-70-crm-pipeline

## Decisiones

### Vista por defecto

`?view=board` por defecto para admin/gestor. `?view=list` alternativa. Rol `tecnico`: forzar lista; ocultar métricas globales y tablero (Stitch `93f7d01c…`).

### Tablero

Columnas = todos los `ProjectState` activos ordenados por `order`. Tarjetas = página actual de `listProjects` (paginación heredada GTK-34). Drag-and-drop HTML5 + menú «Mover a estado» (misma `changeStateAction`). Tras éxito: `router.refresh()`.

### Filtros

Client/RSC form GET; parser existente `project-filters-schema.ts`. Selects con opciones cargadas en servidor (`listPipelineFilterOptions`).

### Presentación lead

`leadType` / `source` vía join en `listSelect`. Antigüedad = días desde `createdAt`.

## Threat model

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Ver pipeline sin `projects.read` | `requirePermission` en queries |
| T2 | Técnico ve proyectos ajenos | `buildProjectListWhere` (GTK-34) |
| T3 | Cambio de estado sin `projects.update` | `changeStateAction` + UI sin DnD si solo lectura (técnico: sin mutación en tablero) |
| T4 | Params URL maliciosos | Zod estricto filtros |
| T5 | IDOR en mutación | `loadProjectForMutation` + ownership |

### Criterios seguridad

- [ ] SEC-1: listado exige `projects.read`
- [ ] SEC-2: mutación solo vía `changeStateAction` con RBAC
- [ ] SEC-3: sin PII nueva (`leadType`/`source` no son PII)
