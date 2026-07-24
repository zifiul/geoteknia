# Security scan — gtk-36

Fecha: 2026-07-24

## Resumen

| Chequeo | Resultado |
|---------|-----------|
| Secretos (`ANTHROPIC_API_KEY` en `lib/`) | Solo `lib/env.ts` + `lib/ia/client.ts` (test SEC-1) |
| SAST manual (diff) | Sin SQL crudo; `server-only` en cliente IA |
| SCA | Sin dependencias nuevas |
| DAST | Omitido — sin endpoints HTTP nuevos |

## Hallazgos

Ninguno bloqueante.

## Notas

- Logs de `runGeneration` excluyen texto de prompt (SEC-2 cubierto en tests).
- FX USD→EUR configurable; revisar valor operativo en producción.
