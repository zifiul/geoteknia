# Security scan — GTK-19

**Fecha:** 2026-07-23  
**Change:** `gtk-19-performance-indexes`  
**Alcance:** diff de migración SQL índices (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | DDL estático generado en migración |
| PII en schema | ⚠️ Esperado | Índices sobre tablas CRM con PII existente; no amplían superficie |
| Datos en prompts IA | ✅ | Sin columnas nuevas |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |
| Índices parciales RGPD | ✅ | Excluyen filas soft-deleted |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
