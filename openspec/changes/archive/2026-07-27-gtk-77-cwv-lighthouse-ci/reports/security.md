# Security scan — gtk-77-cwv-lighthouse-ci

**Fecha:** 2026-07-27

| Chequeo | Resultado |
|---------|-----------|
| SAST (diff) | Sin hallazgos nuevos en workflow/seed público |
| SCA | Sin dependencias nuevas |
| Secretos | Workflow usa placeholders; sin secretos de producción |
| DAST | Omitido — sin endpoints nuevos |

**Notas:** Postgres efímero en CI; `MEDIA_STORAGE_BASE_URL` apunta al propio `next start` para imágenes seed locales.
