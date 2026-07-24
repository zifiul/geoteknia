# Informe fase 2 — Contrato congelado

- Fecha: 2026-07-24
- Cambio: `gtk-32-eventos-conversion`
- US: GTK-32
- Gate 1: aprobado (humano)

## Artefactos

| Pieza | Ruta |
|---|---|
| Zod ejecutable | `lib/analytics/schema.ts` (`conversionEventSchema`, `ingestSchema`, enums Prisma) |
| Barril (exports contrato) | `lib/analytics/index.ts` |
| OpenAPI | `docs/technical/api-spec.yml` — `POST /api/eventos` + schemas |

## Seguridad declarada (`x-geoteknia-authz`)

| Campo | Valor |
|---|---|
| rbac | público |
| permiso | ninguno |
| rateLimit | `RATE_LIMIT_PUBLIC_PER_MIN`, clave `eventos:{ip}`, **cuenta eventos** |
| turnstile | false |
| contentTypes | `application/json`, `text/plain` (beacon) |
| maxBatchSize | 50 |
| PII | sin PII directa; `pageUrl` saneada en persistencia; pseudónimos session/ga |

## Mapeo SEC-N → contrato

| SEC | Reflejo en contrato |
|---|---|
| SEC-1 | Zod `.strict()` + enums cerrados → 400 `VALIDATION_ERROR` |
| SEC-2 | rateLimit por eventos + 429 `Retry-After` |
| SEC-3 | description: `page_url` origin+pathname (impl. fase 4) |
| SEC-4 | `leadId` opcional; description anti-enumeración |
| SEC-5 | respuesta solo `{ recorded }` |
| SEC-6 | fuera del HTTP de eventos; delta lead (impl. fase 4) |

## Congelación

Contrato listo en disco. **Sin commit automático** (harness: commit manual humano). A partir de aquí, cambios de schema/`api-spec.yml` reabren fase 2.

## Estado

- Fase 2: **DONE** — contrato congelado.
