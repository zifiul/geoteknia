# Proposal — gtk-79-admin-dashboard

**Linear:** [GTK-79](https://linear.app/geoteknia/issue/GTK-79/dashboard-del-portal-admin-home-por-rol-kpis-y-accesos-rapidos)

## Qué y por qué

Sustituir el placeholder de `app/(admin)/(portal)/admin/page.tsx` por un dashboard operativo post-login: KPIs, alertas, accesos rápidos y actividad reciente **scoped por rol** (admin, gestor, editor, técnico). Reutiliza `getPipelineMetrics`, `listProjects` y `getCostReport`; añade agregación CMS sobre los 8 `EDITORIAL_CONTENT_TYPES` y alertas SLA (>48 h sin primera respuesta).

## Alcance

- `lib/admin/dashboard-metrics.ts` (+ helpers CMS en paralelo).
- Widgets `components/organisms/admin/dashboard/*`.
- Filtro opcional `?periodo=7d|30d`; extensión mínima `slaOverdue` en filtros CRM para enlaces accionables.
- UI según Stitch Oleada A2 (screens por rol en comentario Linear).
- Tests unit + E2E; sin endpoints públicos ni migraciones Prisma.

## Fuera de alcance

- Listado CMS (`/contenido` índice — GTK-72): CTA degradado documentado.
- Usuarios / audit log UI (GTK-81 / GTK-80): enlaces omitidos hasta existir ruta.

## Impacto

- RF-17 / RF-18 en capa de presentación del back-office.
- Depende de GTK-68 (layout) y GTK-69 (login) — ya en rama base.
