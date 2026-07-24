# Security Scan — gtk-35-crm-gestion-proyectos

- Fecha: 2026-07-24
- Diff analizado: main..HEAD
- Herramientas: Semgrep (security:sast), npm audit (security:sca), gitleaks, DAST script

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | HALLAZGOS (exit 1 orquestador) | 0 en diff GTK-35 | 0 en diff GTK-35 | 0 | 0 |
| SCA | HALLAZGOS pre-existentes | 2 | 3 | — | — |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (sin Route Handlers) | — | — | — | — |

## Hallazgos

### SCA — dependencias transitivas (pre-existentes)

- **Severidad:** alta/crítica (`sharp`, etc.)
- **Ubicación:** `package-lock.json` (no modificado por GTK-35)
- **Estado:** ACEPTADO — fuera del diff; seguimiento infra

### SAST — revisión diff GTK-35

- `import 'server-only'` en módulos de dominio; Server Actions con `withPermission` + Zod.
- `recordAudit` en transacción para `state_change`/`assign`/`delete`; metadata whitelist sin PII.
- Sin `$queryRaw` nuevo; sin endpoints HTTP públicos.
- Hallazgos Semgrep en ficheros QA/HTTP ajenos al change.

### DAST

- Omitido: mutaciones vía Server Actions, no `app/api/**` nuevos.

## Conclusión

- **Apto para fase 6** en superficie introducida por GTK-35.
