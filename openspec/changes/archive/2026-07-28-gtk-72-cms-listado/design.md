# Design — gtk-72-cms-listado

## Decisiones

### Cobertura de tipos (accreditation / lead_magnet)

**Opción (b):** listado y catálogo limitados a los **8** tipos de `EDITORIAL_CONTENT_TYPES`. Acreditaciones y lead magnets quedan fuera hasta extender `workflow-registry` (seguimiento). El menú Stitch de 10 tipos se alinea a 8 en MVP; documentado en AC del delta spec.

### Paginación

Sin tabla polimórfica: `Promise.all` de `findMany` por modelo (mismo patrón que `getCmsWorkflowTotals`), fusión en memoria, orden `updatedAt` desc, slice `(page-1)*pageSize`. Aceptable en MVP por volumen editorial bajo.

### Silos

Catálogo `CmsSilo`: `servicios`, `zonas`, `interseccion`, `casos`, `blog`, `faq`, `equipo`, `maquinaria` — un tipo por silo salvo agrupación futura.

### Rutas

- Listado: `/contenido` (portal, no `/admin/contenido`)
- Editar: `/contenido/{type}/{id}`
- Crear: `/contenido/{type}/nuevo` (placeholder GTK-73)

### Stitch

Cabecera + KPIs (reutilizar conteos `getCmsWorkflowTotals`), tarjeta filtros, tabla `brand-surface`, estado vacío con CTA, sin CTA crear si no `content.create`.

## Threat model

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | Listar sin `content.read` | `requirePermission` en queries |
| T2 | Crear/editar UI sin permiso | Ocultar acciones; RBAC en rutas editor existentes |
| T3 | Filtrar con params maliciosos | Zod estricto en `cms-filters-schema` |
| T4 | Fuga PII cliente en listado | Solo autoría interna (`User.fullName`) |
| T5 | IDOR en filas | Mismo permiso global `content.read` (sin multi-tenant) |

### Criterios seguridad

- [ ] SEC-1: `listCmsContent` exige `content.read`
- [ ] SEC-2: params URL validados con Zod
- [ ] SEC-3: sin datos de leads/clientes en filas
