# Design — gtk-71-crm-detalle-proyecto

## Decisiones

### Composición

RSC `page.tsx` carga `getProjectDetail`, `listPipelineBoardStates`, `listPipelineFilterOptions` (técnicos) y permisos de sesión. Cada bloque mutable es Client Component mínimo que invoca la Server Action existente en `actions.ts` y `router.refresh()` al éxito.

### Transiciones de estado

La UI lista destinos como todos los estados activos distintos del actual, solo si el estado actual no es terminal (misma regla que `changeProjectState` en `transitions.ts`). Función pura `listAllowedStateTransitionTargets` en `lib/projects/state-transition-targets.ts` + tests Vitest.

### Cambio de estado y asignación (Stitch)

Modales Radix (`Dialog`) según pantallas `75456689555a46c5826a2abca3b270ff` y `b258bcf3600c4190b70ff083086e2c28`, en lugar del `<select>` del listado GTK-70.

### Descarga de documentos

**Decisión:** enlace directo a URL pública resuelta con `resolveMediaFileUrl(fileUrl, env.MEDIA_STORAGE_BASE_URL)` en servidor; el usuario ya pasó `projects.read` + ownership en `getProjectDetail`. No se añade Route Handler (la URL de almacenamiento no es secreta; el control es de sesión portal + noindex). Si `fileUrl` es null, no se muestra enlace.

### Lead type / origen

`detailInclude.lead: true` ya expone `leadType` y `source`; formateo con `formatLeadType` / `formatLeadSource`.

### Responsive

Secciones con `<details>` colapsables en móvil; layout de dos columnas en `lg` para datos + timeline (Stitch ficha `a30698c2f9a34f3aa47cfac2f822f25a`).

## Threat model

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Ver detalle sin `projects.read` | `getProjectDetail` + layout portal |
| T2 | IDOR proyecto ajeno | `assertOwnership` → 404 |
| T3 | Mutación sin permiso | `withPermission` + ocultar UI sin permiso |
| T4 | Técnico reasigna o borra | Ocultar `projects.assign` / `projects.delete` |
| T5 | XSS en notas | React escape; sin `dangerouslySetInnerHTML` |
| T6 | Fuga PII en cliente | Sin analytics; solo portal autenticado |

### Criterios seguridad

- [ ] SEC-1: detalle exige `projects.read` y ownership
- [ ] SEC-2: mutaciones solo vía actions GTK-35
- [ ] SEC-3: UI no muestra acciones sin permiso atómico
- [ ] SEC-4: sin PII en mensajes de error del cliente más allá del necesario
