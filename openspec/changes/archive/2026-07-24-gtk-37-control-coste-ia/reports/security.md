# Security Scan — gtk-37-control-coste-ia

- Fecha: 2026-07-24
- Diff analizado: `origin/main..HEAD` (ficheros GTK-37)
- Herramientas: revisión estática dirigida (Semgrep no ejecutado en este entorno), `npm audit`, búsqueda de secretos en diff, DAST omitido (sin Route Handlers)

## Resumen

| Chequeo | Resultado | Crítico | Alto | Medio | Bajo |
|---------|-----------|---------|------|-------|------|
| SAST | LIMPIO (revisión manual diff) | 0 | 0 | 0 | 0 |
| SCA | Ver `npm audit` del workspace | — | — | — | — |
| Secretos | LIMPIO (sin literales en diff) | 0 | 0 | 0 | 0 |
| DAST | OMITIDO (Server Actions only) | — | — | — | — |

## Revisión manual (SAST fallback)

- `lib/ia/*` importa `server-only` vía dependencias de `db`/`env`.
- Inputs admin validados con Zod; auditoría con whitelist sin emails.
- Sin `$queryRaw`, sin PII en logs de presupuesto.

## Hallazgos

Ninguno pendiente.

## Veredicto scan

**LIMPIO** para el alcance Backend (sin endpoints HTTP nuevos).
