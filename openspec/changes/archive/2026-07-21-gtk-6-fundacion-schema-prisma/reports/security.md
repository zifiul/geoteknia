# Security scan — GTK-6

**Fecha:** 2026-07-20  
**Change:** `gtk-6-fundacion-schema-prisma`  
**Alcance:** diff de schema Prisma + `DIRECT_URL` en env (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env.example` sin valores reales; no se tocó `.env` |
| SQL injection | N/A | Sin SQL crudo; migración generada por Prisma |
| PII en schema | ✅ | Solo enums; sin datos personales |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
