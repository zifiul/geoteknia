# Code review — gtk-72-cms-listado

## Alcance

Listado CMS `/contenido`, queries paralelas, dashboard sin stopgap, UI Stitch Oleada A4, tests unit/E2E.

## Checklist

- [x] Patrón RSC + `runWithPortalReadAccess` alineado con GTK-81
- [x] RBAC `content.read` / acciones UI según `content.create` y `content.update`
- [x] Badges con texto + color (WorkflowStatus existente)
- [x] Filtros URL validados (Zod)
- [x] Sin PII de leads en listado
- [x] `reports/security.md` limpio
- [x] Tests unitarios GTK-72

## Seguridad

Threat model T1–T3 cubiertos. Sin endpoints nuevos.

## Observaciones menores

- Paginación en memoria documentada en `design.md` (aceptable MVP).
- Menú crear: 8 tipos (acreditación/lead magnet fuera de alcance).

**Veredicto: APTO**
