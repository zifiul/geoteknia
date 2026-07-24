# Security Scan — gtk-33-calculadora-alcance

- Fecha: 2026-07-24
- Diff analizado: `main..HEAD` (feature branch)
- Herramientas: Semgrep (SAST), npm audit (SCA), gitleaks, DAST (omitido — servidor no levantado)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO | 0 | 0 | 0 | 0 |
| SCA | HALLAZGOS PREEXISTENTES | 2 | 3 | 0 | 0 |
| Secretos | LIMPIO | 0 | 0 | 0 | 0 |
| DAST | NO EJECUTADO | — | — | — | — |

## Hallazgos

### [SEV-ALTA] SCA — dependencia `sharp` (transitiva, no introducida por GTK-33)

- Ubicación: árbol npm global del monorepo
- Descripción: advisories en `sharp` < 0.35.0; no modificada en el diff de calculadora.
- Recomendación: `npm audit fix` en ticket de mantenimiento de dependencias.
- Estado: ACEPTADO (fuera de alcance GTK-33; sin cambio de dependencias en este change)

### DAST ligero

- Servidor `http://localhost:3000` no disponible durante el scan.
- Mitigación: tests unitarios del handler (400/422/429) + curl manual documentado en N+2 cuando el humano levante `npm run dev`.

## Conclusión

Sin hallazgos SAST/secretos atribuibles al diff de GTK-33. SCA con vulnerabilidades preexistentes aceptadas. DAST pendiente de entorno con servidor.
