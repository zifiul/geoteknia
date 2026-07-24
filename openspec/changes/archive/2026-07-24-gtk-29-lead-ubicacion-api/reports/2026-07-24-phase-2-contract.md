# Congelación de contrato — gtk-29-lead-ubicacion-api

- Fecha: 2026-07-24
- Fase: 2 (api-contract-governance)

## Artefactos congelados

- `lib/leads/schema.ts`: `locationLeadSchema`, `LocationLeadInput`, export `emailField` / `phoneField`.
- `docs/technical/api-spec.yml`: `POST /api/leads/ubicacion`, schema `LocationLeadInput`.

## Seguridad declarada (endpoint)

| Campo | Valor |
|-------|--------|
| RBAC | Público |
| Rate limit | `leads-ubicacion:{ip}`, `RATE_LIMIT_PUBLIC_PER_MIN` |
| Turnstile | Sí (403 / 502) |
| PII entrada | email/teléfono, catastral, coords |
| PII salida | Solo `referenceNumber` |

## SEC-N reflejados en contrato

SEC-1..SEC-7 del `design.md` → códigos 400/403/429/502 y validación Zod documentada en OpenAPI.
