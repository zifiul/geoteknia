# Security scan — gtk-72-cms-listado (2026-07-28)

## SAST (diff manual)

- Sin secretos en código nuevo.
- `listCmsContent` server-only + `requirePermission('content.read')`.
- Filtros URL con Zod estricto.

## SCA

- Sin dependencias nuevas.

## Secretos

- Sin hallazgos en archivos del change.

## DAST

- Omitido: sin Route Handlers nuevos.

## Resumen

| Severidad | Count |
|-----------|-------|
| Crítica   | 0     |
| Alta      | 0     |
| Media     | 0     |
| Baja      | 0     |

**Estado:** limpio para gate 6.
