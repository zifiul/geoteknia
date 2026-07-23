# Security scan — GTK-22

**Fecha:** 2026-07-23  
**Change:** `gtk-22-audit-log-service`  
**Alcance:** servicio interno `lib/audit/**` (sin endpoints HTTP)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | Sin `.env` ni credenciales |
| PII en metadata | ✅ Mitigado | Whitelist por acción + redacción password/totp/email |
| `server-only` | ✅ | `log.ts` no importable desde cliente |
| Validación runtime | ✅ | Zod en `recordAudit` |
| Append-only | ✅ | Solo `auditLog.create` |
| Región EU | ✅ | Neon EU vía Prisma existente |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — servicio interno sin superficie HTTP nueva.

## Hallazgos

Ninguno bloqueante.
