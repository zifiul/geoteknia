# Proposal — gtk-26-aislamiento-admin-rate-limiting

> US: [GTK-26 — Aislamiento y endurecimiento de /admin (noindex, robots, rate limiting)](https://linear.app/geoteknia/issue/GTK-26/aislamiento-y-endurecimiento-de-admin-noindex-robots-rate-limiting)
> Dependencias: GTK-23 (`auth()` / `requireSession()`, ✅ en `main`) | Desbloquea: protección temprana de `/admin`, primitiva de rate limit para GTK-28/29/30/31 y login

## Why

El back-office no debe competir en indexación ni diluir crawl budget, y debe resistir abuso (fuerza bruta, scraping) antes de llegar a lógica de negocio. GTK-23 aporta sesión revocable en BD, pero el middleware de Next.js corre en Edge sin Prisma: hace falta una capa optimista en Edge (JWT) y documentar la capa autoritativa en Node (`requireSession()`), más cabeceras `noindex`, `robots.txt` y un limitador reutilizable Edge-compatible.

## What Changes

- Crear `middleware.ts` con matcher `/admin/:path*` y `/api/admin/:path*`: gate JWT vía Auth.js (sin BD), redirect a login en páginas, 401 JSON en APIs, cabeceras de seguridad y `X-Robots-Tag`.
- Extraer configuración Auth.js compatible con Edge para el middleware (sin importar `lib/env.ts` ni Prisma desde Edge).
- Crear `lib/security/rate-limit.ts` (ventana deslizante in-memory en `globalThis`, Edge-compatible) y `lib/security/headers.ts`.
- Crear `app/robots.ts` con `Disallow` de `/admin`.
- Ampliar `lib/env.ts` y `.env.example` con umbrales de rate limit y placeholders opcionales Upstash (sin consumo en MVP).
- Tests unitarios de rate limit, headers y middleware; QA con `curl` (sin E2E Playwright — label `Backend`).
- Documentar en `backend-standards.md` el patrón doble capa Edge/Node y limitación in-memory por instancia.

## Capabilities

### New Capabilities

- `admin-security-hardening`: middleware de aislamiento `/admin`, cabeceras HTTP, `robots.ts` y primitiva `checkRateLimit` reutilizable.

### Modified Capabilities

- `env-validation`: variables `RATE_LIMIT_LOGIN_PER_MIN`, `RATE_LIMIT_PUBLIC_PER_MIN` y opcionales Upstash REST.

## Impact

- **Código:** `middleware.ts`, `lib/auth/auth-edge.ts` (o equivalente), `lib/security/*`, `app/robots.ts`, `lib/env.ts`, `.env.example`, `docs/technical/backend-standards.md`.
- **BD:** sin migración ni escrituras.
- **API:** no crea Route Handlers de negocio; el middleware intercepta rutas existentes bajo `/admin` y `/api/admin/*`.
- **Contrato Zod:** fase 2 omitida (sin nuevos payloads ni Server Actions de este ticket).
- **SEO:** `robots.txt` + cabecera `X-Robots-Tag` autoritativa; meta `robots` en páginas admin queda como defensa en profundidad opcional.
- **RGPD / seguridad:** reduce exposición del portal interno; logs de 401/429 sin PII (IP truncada/hash + ruta).

## Fuera de alcance

- Aplicar rate limiting en `POST /api/leads/*` o generación IA (GTK-28/29/30/31) — solo entregar la primitiva.
- Rate limiting distribuido con Upstash Redis (fase 2; variables opcionales documentadas).
- Sitemap dinámico (GTK-42).
- UI de login (GTK-69).
- Cambios en `prisma/schema.prisma`.
