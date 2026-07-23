# Security scan — GTK-17

**Fecha:** 2026-07-23  
**Change:** `gtk-17-master-seed`  
**Alcance:** seed + lib RBAC/plantillas (Harness DB — sin DAST)

## SAST / secretos

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| Secretos en diff | ✅ Limpio | Sin passwords ni API keys |
| PII en seed | ✅ | Emails/teléfonos placeholder `.local` |
| Credenciales reales | ✅ | NAP y teléfonos marcados como pendientes de cliente |
| Región EU | ✅ | Neon EU |
| Plantillas IA | ✅ | Sin PII en prompts seed |

## SCA

Añadido `tsx` como devDependency para ejecutar seed TypeScript.

## DAST

**Omitido** — sin endpoints nuevos.

## Hallazgos

Ninguno bloqueante.
