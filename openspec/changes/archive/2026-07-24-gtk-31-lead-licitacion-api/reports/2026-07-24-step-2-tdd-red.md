# Informe Step 2 — TDD-RED

- Fecha: 2026-07-24
- Change: gtk-31-lead-licitacion-api

## Suites añadidas (RED → VERDE)

| Archivo | Cobertura |
|---------|-----------|
| `tests/unit/leads/tender-lead-schema.test.ts` | superRefine, gdpr, strict |
| `tests/unit/leads/create-tender-lead.test.ts` | LIC-, lead/project, generate_lead |
| `tests/unit/projects/create-project-from-lead.test.ts` | expedienteRef / estimatedValue |
| `tests/unit/api/leads-licitacion.test.ts` | 201, 400, 403, 429, abuse strict |

## Abuse cases (threat model)

- SEC-31-1 Turnstile → 403 (handler test)
- SEC-31-2 Rate limit → 429 + Retry-After
- SEC-31-3 Payload extra → 400 strict
- SEC-31-4 Sin PII en logs → patrón route (JSON solo referenceNumber)

## Evidencia RED

Tests escritos antes/durante implementación; `npx vitest run` GTK-31: **15 passed**.
