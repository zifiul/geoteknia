# Security scan — GTK-15

**Fecha:** 2026-07-23  
**Change:** `gtk-15-faqs-lead-magnets-calculator-rules`  
**Alcance:** diff de schema Prisma FAQs/lead magnets/calculadora (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | `.env` no incluido en commit |
| SQL injection | N/A | Migración generada por Prisma |
| PII en schema | ✅ | Sin PII; captura de leads en `leads` (DB-11) |
| Datos en prompts IA | ✅ | RNF-IA: contenido técnico de FAQs permitido; sin PII |
| Región EU | ✅ | Neon EU vía `DATABASE_URL` |

## SCA

Sin cambios en `package.json`; no aplica nueva auditoría de dependencias.

## DAST

**Omitido** — Harness DB sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
