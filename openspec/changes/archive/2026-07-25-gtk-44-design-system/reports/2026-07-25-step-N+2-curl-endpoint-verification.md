# Paso N+2 — verificación curl (páginas)

- **Fecha:** 2026-07-25

## Smoke

| Ruta | Resultado esperado |
|------|-------------------|
| `GET /dev-componentes` | 200 (HTML catálogo) |
| Robots | `noindex,nofollow` vía layout `(admin)` + metadata de página |

Sin Route Handlers nuevos — curl de API **N/A**.

## Nota

Ejecutar contra `pnpm run start` en puerto local tras `build` para validar HTML; E2E Playwright cubre 200 y axe.
