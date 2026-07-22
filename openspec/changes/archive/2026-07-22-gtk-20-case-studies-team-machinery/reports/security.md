# Security scan — GTK-20

**Fecha:** 2026-07-22  
**Change:** `gtk-20-case-studies-team-machinery`  
**Alcance:** diff de schema Prisma E-E-A-T (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ⚠️ Documentado | `team_members` (nombre, bio, colegiación); `client_name` condicionado a `client_is_public` |
| Datos en prompts IA | ✅ | RNF-IA: nunca `client_name` ni PII del equipo en prompts |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante. PII de empleados documentada en threat model con base legal consentimiento/relación laboral.
