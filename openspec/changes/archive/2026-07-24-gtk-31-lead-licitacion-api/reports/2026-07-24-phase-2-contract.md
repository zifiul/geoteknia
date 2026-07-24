# Informe fase 2 — contrato congelado

- Fecha: 2026-07-24
- Change: gtk-31-lead-licitacion-api

## Artefactos

- `docs/technical/api-spec.yml`: `POST /api/leads/licitacion`, schema `TenderLeadInput`
- `lib/leads/schema.ts`: `tenderLeadSchema` + `TenderLeadInput`

## Seguridad declarada en contrato

- RBAC: público
- Turnstile: obligatorio
- Rate limit: `leads-licitacion:{ip}`
- PII: entrada HTTPS; salida solo `referenceNumber`

## Estado

Contrato **congelado** para implementación (fases 3–4).
