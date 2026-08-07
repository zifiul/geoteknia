# Gate 2 — gtk-57-maquinaria-detalle (pendiente OK humano)

**Fecha preparación:** 2026-08-07

## Resumen para aprobación

Extensión de GTK-57: ficha individual `/maquinaria/[slug]` que cierra URLs ya en sitemap pero que devolvían 404.

### Entregables

- Página RSC con ISR, SEO sintético, JSON-LD Product + BreadcrumbList
- `getPublishedMachineryBySlug()` + refactor DRY del mapeo
- Enlaces desde listado (`MachineCard`) y servicios (`ServiceEquipment`)
- Revalidación de `/maquinaria` al publicar
- Tests: 30 unitarios + E2E (404 verificado)
- Specs vivas promovidas: `public-machinery-detail`, delta en `public-machinery-listing`

### Gates completados

| Gate / Fase | Estado |
|-------------|--------|
| Gate 1 | OK (usuario) |
| Fase 2 Contrato | Omitida |
| Fases 3–5 QA/Security | OK |
| Fase 6 Code review | `Veredicto: APTO` |
| `require-code-review.sh` | OK |

### Pendiente tras Gate 2

- `/opsx:archive` del change `gtk-57-maquinaria-detalle`
- PR con referencia a GTK-57 (extensión)
- Issue Linear (creación manual si aplica)

**Acción requerida:** OK explícito del humano para archivar y abrir PR.
