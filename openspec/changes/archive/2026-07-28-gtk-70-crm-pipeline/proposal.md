# Proposal — gtk-70-crm-pipeline

**Linear:** [GTK-70](https://linear.app/geoteknia/issue/GTK-70/crm-pipeline-de-proyectos-tablerolista-filtros-metricas) — CRM: pipeline de proyectos (tablero/lista, filtros, métricas).

## Qué y por qué

Sustituir el HTML plano de `/admin/proyectos` por la UI del design system (Stitch Oleada A3): tablero kanban por estado, vista lista, filtros en URL, métricas del pipeline y scoping por rol. Reutiliza `listProjects`, `getPipelineMetrics` y `changeStateAction` (GTK-34/35).

## Alcance

- Ampliar `listSelect` con `lead.leadType` / `lead.source`
- Organismos `components/organisms/admin/crm/*`
- RSC `admin/proyectos/page.tsx` + `loading.tsx`
- Utilidades puras (`board-utils`, vista `?view=board|list`)
- Tests unitarios + E2E Playwright
- **Fuera:** rediseño detalle GTK-71; nuevos endpoints o migraciones

## Stitch (comentario Linear 2026-07-20)

Proyecto `14512274866174259595`, design system `assets/12797274562027555828`:

| Variante | Screen ID |
|----------|-----------|
| Kanban + métricas + filtros | `9e87c198c38c4163bf562d7534cdf962` |
| Lista | `aa942bcd6d5f49ac9de6db2dfdbfc799` |
| Vacío filtros | `66cbc9e085604ad9be340d269c83fe6d` |
| Técnico (lista, sin kanban/métricas globales) | `93f7d01c85c6450187548dffcd3c4c3e` |

## Impacto

Sin `api-spec.yml` (sin Route Handlers nuevos). RBAC `projects.read` / `projects.update` existente.
