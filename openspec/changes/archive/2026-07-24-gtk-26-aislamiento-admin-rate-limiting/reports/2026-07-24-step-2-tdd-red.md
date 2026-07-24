# Informe TDD-RED — GTK-26 (fase 3)

- Fecha: 2026-07-24
- Change: `gtk-26-aislamiento-admin-rate-limiting`
- Rama: `feature/backend-gtk-26-aislamiento-admin-rate-limiting`

## Suites y trazabilidad

| Fichero | Requisitos / SEC |
|---------|------------------|
| `tests/unit/security/rate-limit.test.ts` | Delta `checkRateLimit`, ventana, SEC-4 |
| `tests/unit/security/rate-limit-env.test.ts` | Lectura Edge-safe de umbrales |
| `tests/unit/security/headers.test.ts` | `SECURITY_HEADERS`, SEC-3 |
| `tests/unit/security/middleware.test.ts` | SEC-1, SEC-2, SEC-3 |
| `tests/unit/security/robots.test.ts` | `robots.txt` Disallow `/admin` |
| `tests/unit/env.test.ts` (describe GTK-26) | Delta `env-validation` rate limit + Upstash opcional |

## Comando ejecutado (GTK-26)

```bash
npx vitest run tests/unit/security tests/unit/env.test.ts
```

## Resultado — RED verificado

```
Test Files  6 failed (6)
Tests       2 failed | 5 passed (7)
```

- **5 suites** fallan por módulos de producción inexistentes (`@/lib/security/*`, `@/middleware`, `@/app/robots`) — RED esperado.
- **2 tests** en `env.test.ts` fallan por propiedades `RATE_LIMIT_*` aún no definidas en `lib/env.ts`.
- **1 test** Upstash opcional pasa de forma incidental (`undefined` ya es el estado actual).

Suite preexistente (muestra GTK-24/auth): tests de validación env originales siguen en verde al filtrar describe GTK-26.

## Contrato de implementación (fase 4a)

| Módulo | Responsabilidad |
|--------|-----------------|
| `lib/security/rate-limit.ts` | `checkRateLimit`, store `globalThis`, Edge-safe |
| `lib/security/rate-limit-env.ts` | `readRateLimitEnv()` sin `server-only` |
| `lib/security/headers.ts` | `SECURITY_HEADERS`, `withNoIndexHeaders` |
| `lib/auth/auth-edge.ts` | `auth()` mínimo para middleware |
| `middleware.ts` | matcher, redirect `/admin/login`, 401 JSON API, cabeceras |
| `app/robots.ts` | `MetadataRoute.Robots` con Disallow admin |
| `lib/env.ts` + `.env.example` | `RATE_LIMIT_*`, Upstash opcional |

## SEC-N ↔ tests

| SEC | Cobertura TDD |
|-----|----------------|
| SEC-1 | `middleware.test.ts` redirect sin sesión |
| SEC-2 | `middleware.test.ts` 401 JSON `/api/admin` |
| SEC-3 | `headers.test.ts`, `middleware.test.ts` |
| SEC-4 | `rate-limit.test.ts` |
| SEC-5 | **Hueco intencional** — verificación documental fase 7 (`backend-standards.md`); reviewer fase 6 |

## Abuse cases omitidos (justificación)

| Categoría | Motivo |
|-----------|--------|
| RBAC 403 en middleware | Solo authn JWT; authz en GTK-25/handlers |
| Turnstile | Portal interno |
| Rate limit 429 en HTTP | Cableado GTK-28+; primitiva cubierta en unit |
| PII en logs | Assert en fase 4/6 si se extrae helper de log |

## E2E (fase 5a)

**Omitido** — label `Backend`. Escenarios curl en `tasks.md` §7.

## Siguiente fase

Implementación 4a hasta VERDE completo de las suites anteriores.
