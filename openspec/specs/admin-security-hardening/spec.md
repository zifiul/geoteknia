# admin-security-hardening Specification

## Purpose

Aislamiento del portal `/admin` frente a indexación y acceso anónimo temprano (middleware Edge), cabeceras HTTP de endurecimiento, `robots.txt` y primitiva de rate limiting reutilizable (GTK-26).

## Requirements

### Requirement: Middleware protege rutas /admin y /api/admin

El sistema SHALL ejecutar un middleware en Edge para peticiones cuyo path coincide con `/admin/:path*` o `/api/admin/:path*`. El middleware SHALL comprobar la presencia de un JWT de sesión Auth.js válido y no expirado (verificación criptográfica sin consulta a base de datos). Si no hay sesión válida, SHALL responder con redirect HTTP 302 a la ruta de login del portal para peticiones de página HTML y con HTTP 401 y cuerpo JSON para peticiones bajo `/api/`.

#### Scenario: Página admin sin sesión

- **WHEN** un cliente anónimo solicita `GET /admin` o cualquier subruta bajo `/admin/` sin cookie de sesión válida
- **THEN** la respuesta es un redirect 302 hacia la ruta de login configurada para el portal

#### Scenario: API admin sin sesión

- **WHEN** un cliente anónimo solicita cualquier método bajo `/api/admin/` sin cookie de sesión válida
- **THEN** la respuesta es HTTP 401 con cuerpo JSON y sin datos de sesión ni PII

#### Scenario: Petición con JWT válido

- **WHEN** el cliente presenta un JWT de sesión Auth.js firmado y no expirado
- **THEN** la petición continúa al handler o Server Component subyacente

### Requirement: Cabeceras de no-indexación y endurecimiento en respuestas admin

Para respuestas servidas tras el middleware en rutas `/admin` y `/api/admin`, el sistema SHALL añadir `X-Robots-Tag: noindex, nofollow` y las cabeceras de seguridad definidas en `lib/security/headers.ts` (incluyendo `X-Content-Type-Options: nosniff` y `Referrer-Policy` documentada).

#### Scenario: Cabecera X-Robots-Tag en página admin

- **WHEN** se sirve una respuesta exitosa o de error bajo `/admin` tras pasar el middleware
- **THEN** la respuesta incluye `X-Robots-Tag` con valor `noindex, nofollow`

#### Scenario: Cabeceras de seguridad presentes

- **WHEN** se aplica `withNoIndexHeaders` o el conjunto `SECURITY_HEADERS` a una `Response`
- **THEN** las cabeceras configuradas están presentes con los valores documentados en el módulo

### Requirement: robots.txt excluye el portal admin

El sistema SHALL publicar `app/robots.ts` como `MetadataRoute.Robots` con regla `Disallow` que cubra `/admin` y subrutas, de modo que los crawlers no invoquen el área de back-office.

#### Scenario: robots.txt en producción

- **WHEN** un cliente solicita `/robots.txt`
- **THEN** el contenido incluye una directiva `Disallow` para el prefijo `/admin`

### Requirement: Primitiva checkRateLimit reutilizable

El módulo `lib/security/rate-limit.ts` SHALL exportar `checkRateLimit(key: string, limit: number, windowMs: number)` que devuelve `{ allowed: boolean; retryAfterMs?: number }` usando una ventana deslizante en memoria por clave, sin dependencias Node-only, de forma invocable desde Edge y desde Route Handlers Node.

#### Scenario: Dentro del límite

- **WHEN** se realizan N peticiones con la misma `key` dentro de `windowMs` y N es menor o igual que `limit`
- **THEN** cada llamada devuelve `allowed: true`

#### Scenario: Supera el límite

- **WHEN** se realiza la petición `limit + 1` con la misma `key` dentro de la misma ventana
- **THEN** la llamada devuelve `allowed: false` y `retryAfterMs` positivo

#### Scenario: Ventana expirada

- **WHEN** ha transcurrido más de `windowMs` desde el inicio de la ventana de la `key`
- **THEN** la siguiente petición reinicia el contador y devuelve `allowed: true`

### Requirement: Doble capa de sesión documentada

El sistema SHALL documentar que el middleware Edge no sustituye a `requireSession()` en runtime Node: la revocación en tabla `sessions` solo es autoritativa en Server Components, Server Actions y Route Handlers que invoquen `requireSession()` o equivalente de GTK-23.

#### Scenario: Sesión revocada en BD con JWT aún válido

- **WHEN** una sesión fue revocada en base de datos pero el JWT aún no ha expirado
- **THEN** el middleware puede permitir el paso optimista y el handler Node que use `requireSession()` SHALL rechazar la petición
