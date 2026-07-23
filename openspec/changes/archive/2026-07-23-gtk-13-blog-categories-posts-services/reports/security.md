# Security scan — GTK-13

**Fecha:** 2026-07-23  
**Change:** `gtk-13-blog-categories-posts-services`  
**Alcance:** diff de schema Prisma blog (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ✅ | Sin PII directa; autoría vía `team_members` |
| Datos en prompts IA | ✅ | RNF-IA: `body` técnico sin PII |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
