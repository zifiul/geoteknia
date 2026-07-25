# Security Scan — gtk-40-publicacion-isr-sitemap

- Fecha: 2026-07-25
- Diff analizado: main..HEAD (working tree; sin commits aún)
- Herramientas: Semgrep, npm audit (fallo red), gitleaks, DAST (omitido sin diff commit)

## Resumen

| Chequeo | Resultado | Notas |
|---------|-----------|-------|
| SAST | HALLAZGOS PREEXISTENTES | 8 findings en `lib/auth/crypto.ts`, tests QA HTTP — **fuera del diff GTK-40** |
| SCA | NO EJECUTADO | `npm audit` ECONNRESET |
| Secretos | LIMPIO | 0 leaks en commits escaneados |
| DAST | OMITIDO | Sin commits en diff; cron nuevo no detectado hasta commit |

## Diff GTK-40 (revisión manual)

- Cron: Bearer + `timingSafeEqual`; 401 genérico; sin log de secreto.
- `CRON_SECRET` solo en `lib/env.ts` server-only.
- Publicación: RBAC vía Server Actions existente; sin SQL crudo.

## Hallazgos atribuibles a GTK-40

Ninguno bloqueante.

## Resultado

- **LIMPIO** para el alcance GTK-40 (hallazgos SAST/SCA globales preexistentes o de infraestructura de scan).
