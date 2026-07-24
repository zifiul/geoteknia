# Informe fase 2 — Contrato congelado

- Fecha: 2026-07-24
- Cambio: `gtk-33-calculadora-alcance`
- US: GTK-33

## Artefactos

| Pieza | Ruta |
|---|---|
| Zod ejecutable | `lib/calculator/schema.ts` |
| OpenAPI | `docs/technical/api-spec.yml` — `POST /api/calculadora` + schemas |
| Motor (tipos) | `lib/calculator/estimate.ts` |

## Seguridad declarada (`x-geoteknia-authz`)

| Campo | Valor |
|---|---|
| rbac | público |
| permiso | ninguno |
| rateLimit | `RATE_LIMIT_PUBLIC_PER_MIN`, clave `calculadora:{ip}` |
| turnstile | false |
| PII | sin PII; solo slugs y parámetros técnicos de obra |

## Mapeo SEC-N → contrato

| SEC | Reflejo |
|---|---|
| SEC-1 | Zod `.strict()` + slugs → 400 |
| SEC-2 | 429 `RATE_LIMITED` + `Retry-After` |
| SEC-3 | schemas sin campos de precio |
| SEC-4 | fórmula discriminada `linear` (sin eval) |
| SEC-5 | 500 `INTERNAL_ERROR` documentado |
| SEC-6 | telemetría best-effort (impl. fase 4) |
| SEC-7 | logs sin PII (impl. fase 4) |

## Congelación

Contrato listo en disco. Commit manual (harness).
