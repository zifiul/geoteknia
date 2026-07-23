# Security scan — GTK-8

**Fecha:** 2026-07-23  
**Change:** `gtk-8-accreditations-tenders-support`  
**Alcance:** diff de schema Prisma acreditaciones/licitaciones (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada manualmente siguiendo convención Prisma |
| PII en schema | ✅ | Datos corporativos; sin PII personal |
| Datos en prompts IA | ✅ | RNF-IA: no se usan en prompts Claude |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
