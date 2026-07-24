# Informe TDD-RED — gtk-34-crm-pipeline-proyectos

- Fecha: 2026-07-24
- US: GTK-34
- Agente: harness (post Gate 1)

## Suites añadidas

- `tests/unit/projects/project-filters-schema.test.ts` (SEC-4)
- `tests/unit/projects/project-list-where.test.ts` (SEC-2)
- `tests/unit/projects/project-queries.test.ts` (SEC-1, SEC-3, SEC-5)
- `tests/unit/projects/project-metrics.test.ts`

## Evidencia RED → GREEN

Tras Gate 1 se escribieron los tests contra módulos aún inexistentes (`lib/projects/queries.ts`, `metrics.ts`, etc.); la importación falló hasta completar la fase 4. Tras implementación:

```
npm run test -- tests/unit/projects
→ 49 files, 237 tests passed (incl. 4 nuevos ficheros GTK-34)
```

## Abuse cases cubiertos

| SEC | Test |
|-----|------|
| SEC-1 | `editor` → `ForbiddenError` sin Prisma |
| SEC-2 | `tecnico` ignora `technicianId` ajeno en `where` |
| SEC-3 | Detalle técnico ajeno → `ProjectNotFoundError` |
| SEC-4 | Zod `pageSize` / `.strict()` |
| SEC-5 | `deletedAt: null` en detalle |
