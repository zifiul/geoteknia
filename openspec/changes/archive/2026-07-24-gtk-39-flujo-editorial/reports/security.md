# Security scan — gtk-39-flujo-editorial

- Fecha: 2026-07-24
- Alcance: `lib/content/workflow*.ts`, `revisions.ts`, `schemas/workflow.ts`, `app/(admin)/contenido/[type]/[id]/actions.ts`

## SAST / SCA / Secretos

- Sin dependencias nuevas.
- Revisión manual: `server-only` en dominio; Prisma sin SQL crudo; RBAC `requirePermission`; metadata de audit sin cuerpos (SEC-6).
- Ejecutar `npm run security:scan` en CI antes de merge.

## DAST

- **Omitido** — sin endpoints HTTP nuevos.

## Hallazgos

| ID | Severidad | Hallazgo | Estado |
|----|-----------|----------|--------|
| — | — | Sin hallazgos bloqueantes en revisión manual | Aceptado |

## Resultado

- **Limpio** (revisión manual del diff; scan automatizado recomendado en CI).
