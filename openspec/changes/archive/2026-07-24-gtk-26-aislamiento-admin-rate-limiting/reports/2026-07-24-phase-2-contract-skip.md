# Informe — Fase 2 contrato omitida (GTK-26)

- Fecha: 2026-07-24
- Change: `gtk-26-aislamiento-admin-rate-limiting`
- Gate 1: aprobado (humano, 2026-07-24)

## Motivo de omisión

La US **no introduce** Route Handlers de negocio ni Server Actions con payloads nuevos. El alcance es infraestructura transversal:

- `middleware.ts` (comportamiento HTTP documentado en delta spec `admin-security-hardening`, no contrato Zod request/response).
- `lib/security/rate-limit.ts` y `lib/security/headers.ts` (API de librería interna; call-sites en GTK-28+).
- `app/robots.ts` (Metadata Route, sin body JSON).
- Ampliación de `lib/env.ts` (validación de entorno, spec `env-validation`).

Criterio harness (`docs/harness-geoteknia.md` § fase 2): *«si la US no toca API ni mutaciones, se omite y se registra en el resumen de fase»*.

## Artefactos de contrato

| Pieza | Estado |
|-------|--------|
| Schemas Zod nuevos de endpoint/acción | **N/A** — sin endpoints/acciones nuevas |
| `docs/technical/api-spec.yml` | **Sin cambios** — no hay paths OpenAPI nuevos; el 401 bajo `/api/admin/*` queda cubierto por requisitos de `admin-security-hardening` y tests de middleware |
| Tabla authz por endpoint | **N/A** — middleware aplica authn JWT (GTK-23); authz RBAC sigue en handlers (GTK-25) |

## Seguridad congelada sin contrato HTTP

Los requisitos SEC-1–SEC-5 del `design.md` quedan anclados a:

- Delta spec `openspec/changes/gtk-26-aislamiento-admin-rate-limiting/specs/admin-security-hardening/spec.md`
- Tests TDD-RED (fase 3) y evidencia `curl` (fase 5a)

La primitiva `checkRateLimit(key, limit, windowMs)` no fija aún umbrales en call-sites HTTP; los valores `RATE_LIMIT_*` en `env` se consumirán cuando GTK-28+ cableen login y captación pública.

## Congelación

**Contrato HTTP/Zod congelado en estado «sin cambios»** respecto a `main`. Cualquier endpoint futuro que use `checkRateLimit` deberá declarar rate limit en su propia fase 2.

## Siguiente fase

TDD-RED (fase 3): tests unitarios de `rate-limit`, `headers`, `middleware`, `robots` y env; abuse cases SEC-1–SEC-4; evidencia en `reports/2026-07-24-step-2-tdd-red.md`.
