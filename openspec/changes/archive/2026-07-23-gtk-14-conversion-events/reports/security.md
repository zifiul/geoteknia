# Security scan — GTK-14

**Fecha:** 2026-07-23  
**Change:** `gtk-14-conversion-events`  
**Alcance:** diff de schema Prisma conversion_events (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ⚠️ Esperado | `ga_client_id`, `session_id` — identificadores de seguimiento; base legal consentimiento cookies |
| Datos en prompts IA | ✅ | RNF-IA: datos de tracking prohibidos en prompts Claude |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |
| Append-only | ✅ | Sin mutación ni soft delete en eventos |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
