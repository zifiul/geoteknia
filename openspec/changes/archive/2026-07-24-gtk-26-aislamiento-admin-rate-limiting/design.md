# Design — gtk-26-aislamiento-admin-rate-limiting

> Infraestructura transversal: middleware Edge, SEO de `/admin`, rate limit in-memory.

## Context

- GTK-23 entrega `auth()` y `requireSession()` con JWT + espejo `sessions` en BD (revocación autoritativa en callbacks Node).
- `lib/auth/config.ts` usa `import 'server-only'`, Prisma y `lib/env.ts` — **no importable desde `middleware.ts` (Edge)**.
- No existe `middleware.ts` ni `app/robots.ts` en el repo.
- Endpoints públicos de captación (GTK-28+) aún no existen; el limitador se entrega como librería.
- Label Linear `Backend`: QA omite E2E Playwright (harness § Regla QA).

## Goals / Non-Goals

**Goals:**

- Bloquear acceso anónimo a `/admin` y `/api/admin/*` lo antes posible (Edge).
- Centralizar `X-Robots-Tag` y cabeceras de endurecimiento.
- Publicar `robots.txt` con `Disallow` de admin.
- Exponer `checkRateLimit` Edge-compatible con interfaz lista para Upstash.
- Documentar patrón doble capa y limitación MVP in-memory.

**Non-Goals:**

- Integrar rate limit en login o leads (tickets posteriores).
- Redis/Upstash en runtime.
- Migración Prisma.
- Sitemap (GTK-42).

## Decisions

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `lib/auth/auth-edge.ts` con `NextAuth(authEdgeConfig)` mínimo (secret + JWT, sin providers/Prisma) | Importar `lib/auth/config.ts` en middleware | Edge no puede cargar `server-only` ni Prisma |
| Middleware solo verifica JWT (`auth()` edge) | Comprobar `sessions` en middleware | Imposible en Edge con cliente Prisma actual |
| Rate limit en `Map` en `globalThis` | Tabla BD de contadores | Sin schema; MVP; documentar no compartido entre isolates |
| Umbrales en `lib/env.ts` (Node) + helper `readRateLimitConfigFromProcessEnv()` sin `server-only` para Edge | Importar `env` desde middleware | `lib/env.ts` es server-only |
| Login redirect a `/admin/login` o ruta acordada con GTK-69 | Hardcode `/login` | Alinear con App Router existente (`/api/auth` ya montado) — usar `/admin/login` si existe o documentar callback URL de Auth.js |
| `app/robots.ts` array extensible comentado para thank-you pages | Incluir rutas inexistentes | GTK-28+ añadirán patrones |

### Flujo middleware

1. Matcher limita a `/admin` y `/api/admin`.
2. (Opcional futuro en mismo archivo) rate limit por IP+path para login — **fuera de alcance de wiring** en este ticket salvo primitiva lista.
3. `auth()` edge: si no hay sesión → redirect (página) o 401 JSON (API).
4. Aplicar `withNoIndexHeaders` + `SECURITY_HEADERS` a la respuesta (NextResponse.next con headers).

### Rate limit

```ts
checkRateLimit(key, limit, windowMs): { allowed, retryAfterMs? }
```

Clave compuesta sugerida para call-sites: `login:${ipHash}`, `public:${ipHash}:${route}`.

### Observabilidad

`console` estructurado JSON en middleware para 401 (sin email; IP truncada o hash simple en Edge sin node:crypto — usar slice de IP o Web Crypto si disponible).

## Threat model

### Superficie de ataque

- Prefijo `/admin` y `/api/admin/*` (descubrimiento, fuerza bruta, scraping).
- `robots.txt` y cabeceras (fuga de URLs internas — bajo impacto).
- Store in-memory de rate limit (DoS por claves arbitrarias — mitigar longitud máxima de key en call-sites futuros).

### Actores

- Anónimo / bot (crawlers, credential stuffing contra login cuando se cablee).
- Usuario autenticado con JWT robado.
- Atacante con sesión revocada en BD pero JWT vigente (ventana hasta expiración TTL).

### Datos sensibles implicados

- JWT de sesión (cookie HttpOnly).
- IP en logs (minimizar; no PII de leads).
- Contenido admin no indexado (confidencialidad operativa, no PII masiva en este ticket).

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Acceso anónimo a `/admin` | GET directo | Alto | Middleware JWT + redirect/401 |
| T2 | Indexación de back-office | Crawlers | Medio | `X-Robots-Tag`, `robots.txt`, meta existente |
| T3 | Fuerza bruta login/API | Volumen de peticiones | Alto | `checkRateLimit` + umbrales env (cableado en tickets posteriores) |
| T4 | Bypass asumiendo middleware suficiente | Sesión revocada | Alto | Documentar + `requireSession()` en Node |
| T5 | Import Prisma en Edge | Error build o bypass | Alto | `auth-edge` separado; estándar backend |
| T6 | Fuga PII en logs 401/429 | Logging verboso | Medio | Solo ruta + IP truncada |

### Amenazas descartadas

- **Turnstile en `/admin`:** portal interno; no formulario público en este ticket.
- **RBAC por permiso atómico en middleware:** authz en GTK-25/handlers; middleware solo authn JWT.
- **DAST en endpoints nuevos:** no hay Route Handlers nuevos; curl a rutas protegidas en QA.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: Petición anónima a `/admin` recibe redirect a login (curl/evidencia QA).
- [ ] SEC-2: Petición anónima a `/api/admin/test` (o ruta ficticia bajo prefijo) recibe 401 JSON.
- [ ] SEC-3: Respuesta bajo `/admin` incluye `X-Robots-Tag: noindex, nofollow`.
- [ ] SEC-4: `checkRateLimit` bloquea la petición `limit+1` en la misma ventana (test unitario).
- [ ] SEC-5: Documentación backend prohíbe Prisma/`lib/env.ts` en middleware y describe doble capa.

## Testing

- Unit: `tests/unit/security/rate-limit.test.ts`, `headers.test.ts`, `middleware.test.ts` (NextRequest simulado, `auth` mockeado).
- QA: curl sin sesión (302/401) y cabecera robots; **E2E omitido — label `Backend`**.

## Docs

- `docs/technical/backend-standards.md`: sección Edge vs Node para auth/middleware.
- `.env.example`: nuevas variables.
