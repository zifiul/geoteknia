# N+2 — curl — gtk-78

- **Fecha:** 2026-07-25
- **Rutas:** `GET /dev-seo/canonical-lab`, `?page=2`, `?utm_source=x`, `?servicio=sondeos`
- **Nota:** Sin Route Handlers nuevos; verificación HTML estática.

## Evidencia

E2E Playwright (mismo HTML servido por `next start` puerto 3010) confirma:

- `link[rel=canonical]` sin UTM en query con `?utm_source=newsletter`
- `meta robots` con `noindex` cuando `?servicio=sondeos`
- canonical con `page=2` y `link rel=prev|next` presentes

Comando local recomendado tras `pnpm run build && pnpm exec next start -p 3010`:

```bash
curl.exe -s "http://localhost:3010/dev-seo/canonical-lab?page=2" | findstr canonical
```
