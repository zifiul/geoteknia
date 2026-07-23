# Security scan — GTK-12

**Fecha:** 2026-07-23  
**Change:** `gtk-12-crm-contacts-leads-projects-pipeline`  
**Alcance:** diff de schema Prisma CRM (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ⚠️ Esperado | PII comercial en contacts/leads/projects; soft delete RGPD |
| Datos en prompts IA | ✅ | RNF-IA: PII del CRM prohibida en prompts Claude |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |
| Consentimiento | ✅ | `leads.gdpr_consent` NOT NULL |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
