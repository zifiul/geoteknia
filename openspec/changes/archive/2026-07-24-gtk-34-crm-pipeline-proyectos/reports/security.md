# Security Scan — gtk-34-crm-pipeline-proyectos

- Fecha: 2026-07-24
- Diff analizado: main..HEAD (rama feature)
- Herramientas: Semgrep (security:sast), npm audit (security:sca), gitleaks, DAST script

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS (exit 1 en orquestador) | 0 en diff GTK-34 | 0 en diff GTK-34 | 0 | 0 |
| SCA | HALLAZGOS pre-existentes | 2 | 3 | — | — |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sin API nueva) | — | — | — | — |

## Hallazgos

### SCA — dependencias transitivas (pre-existentes, fuera del diff GTK-34)

- **Severidad:** alta/crítica en árbol existente (`sharp`, etc.)
- **Ubicación:** `package-lock.json` (no modificado por GTK-34)
- **Estado:** ACEPTADO — no introducido por este change; seguimiento en US de dependencias/infra

### SAST

- Revisión manual del diff GTK-34: `import 'server-only'` en `queries.ts`/`metrics.ts`; `$queryRaw` con `Prisma.sql` + `Prisma.join` sobre UUIDs acotados por subconsulta previa; sin PII en logs; RBAC `projects.read` + scoping.
- Sin hallazgos bloqueantes atribuibles a GTK-34.

### DAST

- Omitido: no hay `app/api/**/route.ts` nuevos.

## Conclusión

- **Apto para fase 6** respecto a superficie introducida por GTK-34, con SCA global pendiente de proyecto.
