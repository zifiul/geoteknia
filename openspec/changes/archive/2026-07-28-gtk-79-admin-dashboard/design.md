# Design — gtk-79-admin-dashboard

## Enfoque

- **Página:** RSC `app/(admin)/(portal)/admin/page.tsx` mantiene `runWithPortalReadAccess` + `getPortalSession`; compone `KpiGrid`, `AlertsPanel`, `QuickActions`, `RecentActivity` y `DashboardPeriodControl` (cliente mínimo para `?periodo=`).
- **Datos:** `getDashboardData(period)` en `lib/admin/dashboard-metrics.ts` orquesta por `roleName`; CMS con 8 `groupBy` en `Promise.all`; SLA con `buildProjectListWhere` + `firstResponseAt: null` y `createdAt` &lt; hace 48 h.
- **Stitch:** proyecto `14512274866174259595`, design system `12797274562027555828`; pantallas admin/gestor/editor/técnico (`305eb077…`, `1df85654…`, `3b19743b…`, `73e9fe13…`). Layout: cabecera con periodo, grid KPI 2–4 columnas, fila alertas + accesos, actividad reciente en tarjeta `bg-brand-surface` con borde suave.
- **CMS CTA:** sin GTK-72, acceso rápido «Contenido» apunta al primer `blog_post` editable si existe; si no, copy informativo sin enlace roto.

## Threat model

### Superficie

- Dashboard autenticado `/admin` (solo lectura agregada).
- Query `periodo`, futuros filtros CRM en enlaces desde KPIs.

### Actores

- Usuario con rol limitado (fuga de métricas globales o ajenas).
- Anónimo (middleware + `runWithPortalReadAccess`).

### Datos sensibles

- KPIs agregados sin PII de leads; actividad reciente solo título de proyecto (dato operativo ya visible en pipeline).

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Editor ve KPIs CRM | Composición por rol; no invocar `getPipelineMetrics` sin `projects.read` |
| T2 | Técnico ve pipeline global | Scoping en `buildProjectListWhere` / `requirePermission` |
| T3 | CMS sin `content.read` | `requirePermission('content.read')` antes de agregador |
| T4 | Coste IA sin permiso | `requirePermission('ai.read')` antes de `getCostReport` |
| T5 | IDOR vía enlaces | Rutas destino reutilizan RBAC existente |

### Criterios seguridad

- [ ] SEC-1: agregador CMS exige `content.read`.
- [ ] SEC-2: métricas CRM/SLA exigen `projects.read` con scoping técnico.
- [ ] SEC-3: sin PII en payloads de widgets.
- [ ] SEC-4: sin Route Handlers públicos nuevos.

## Decisiones

- Filtro `slaOverdue` en `project-filters-schema` (Zod) para enlaces desde alertas; sin cambio en `api-spec.yml` (no expuesto como API pública).
- Widgets en `components/organisms/admin/dashboard/` (convención GTK-68).
