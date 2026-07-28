# Security scan — GTK-75 (2026-07-28)

| Chequeo | Resultado |
|---------|-----------|
| SAST (diff manual) | Sin secretos en cliente; Server Actions con `requirePermission` |
| SCA (`npm audit` — high) | Sin nuevas dependencias |
| Secretos (gitleaks N/A local) | Sin `.env` en diff |
| DAST | Omitido — sin Route Handlers nuevos |

**Hallazgos:** ninguno bloqueante.
