# Proposal — gtk-71-crm-detalle-proyecto

**Linear:** [GTK-71](https://linear.app/geoteknia/issue/GTK-71/crm-detalle-de-proyecto-estado-tecnico-hitos-notas-documentos) — CRM: detalle de proyecto (estado, técnico, hitos, notas, documentos).

## Qué y por qué

Completar la ficha interactiva en `/admin/proyectos/[id]` sobre la capa de lectura (`getProjectDetail`) y mutación ya auditada (GTK-35), reutilizando el patrón `useTransition` + `router.refresh()` de GTK-70. Sin nuevas Server Actions ni Route Handlers.

## Alcance

- Organismos `ProjectHeader`, `StateChanger`, `TechnicianAssign`, `Milestones`, `Notes`, `Documents` + composición en `page.tsx` y `loading.tsx`
- Utilidad pura de destinos de transición de estado (alineada con `changeProjectState`)
- RBAC en UI: ocultar asignación y borrados sin `projects.assign` / `projects.delete`
- Descarga de documentos: URL absoluta vía `resolveMediaFileUrl` + `MEDIA_STORAGE_BASE_URL` (portal autenticado; sin endpoint nuevo)
- Tests unitarios (transiciones) + E2E Playwright
- **Fuera:** nuevas Server Actions; endpoint de descarga firmada (decisión documentada en `design.md`)

## Stitch (comentario Linear 2026-07-20)

Proyecto `14512274866174259595`, design system `assets/12797274562027555828`:

| Pantalla | Screen ID |
|----------|-----------|
| Ficha completa | `a30698c2f9a34f3aa47cfac2f822f25a` |
| Modal cambiar estado | `75456689555a46c5826a2abca3b270ff` |
| Modal asignar técnico | `b258bcf3600c4190b70ff083086e2c28` |
| Skeleton | `710e2b88b828433eaa5a195a2065aeb0` |
| Error 404 / sin permiso | `9ce90fde601b4207ae346d48b303e3dd` |
| Guardando + toast éxito | `b45dab3e6eab4cf6bdcb39ec501200dc` |

## Impacto

Sin cambios en `api-spec.yml`. Permisos existentes `projects.read` / `projects.update` / `projects.assign` / `projects.delete`.
