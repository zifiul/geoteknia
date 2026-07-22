# Security scan — GTK-7

**Fecha:** 2026-07-22  
**Change:** `gtk-7-rbac-users-sessions-audit`  
**Alcance:** diff de schema Prisma RBAC (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ⚠️ Diseño | `users`, `sessions`, `audit_logs` almacenan PII por diseño (documentado en threat model) |
| Credenciales | ✅ | `password_hash` y `twofa_secret` documentados; hash/cifrado en capa de aplicación |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
