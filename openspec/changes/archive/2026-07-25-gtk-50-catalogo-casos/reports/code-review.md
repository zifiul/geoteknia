# Code Review — gtk-50-catalogo-casos

**Fecha:** 2026-07-25  
**Diff:** `main..HEAD` (catálogo `/proyectos`)

## Checklist

- [x] Reutiliza GTK-78 (`canonical`, `robots-rules`, `PaginationLinks`) sin duplicar lógica.
- [x] `PUBLISHED_EDITORIAL_WHERE` como base de listado.
- [x] Filtros inválidos ignorados; sin PII en tarjetas.
- [x] Client components solo para navegación/tracking; datos en RSC.
- [x] Tests unitarios y E2E del flujo.
- [x] `reports/security.md` — SAST/secretos limpios; SCA preexistente documentado.

## Notas

- Enlaces a `/proyectos/[slug]` pendientes de GTK-53 (404 esperado).
- Tras `pnpm run build`, E2E requiere servidor fresco (`CI=true` o reiniciar `next start` en :3010).

**Veredicto: APTO**
