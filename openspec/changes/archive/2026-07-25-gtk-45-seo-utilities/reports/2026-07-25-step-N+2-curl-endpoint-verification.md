# Paso N+2 — verificación HTTP (página de prueba)

- **Fecha:** 2026-07-25

## Smoke

| Ruta | Resultado |
|------|-----------|
| `GET /dev-seo` | 200 (E2E Playwright + build estático) |
| `link[rel=canonical]` | `/servicios/dev-seo-test` |
| `script[type=application/ld+json]` | 2 bloques (Service + BreadcrumbList) |
| `robots` | `noindex` (metadata página de prueba) |

Sin Route Handlers nuevos — curl de API **N/A**.

## Nota

E2E `gtk45-seo-dev-page.spec.ts` valida HTML servido y escapado SEC-1 en `response.text()`.
