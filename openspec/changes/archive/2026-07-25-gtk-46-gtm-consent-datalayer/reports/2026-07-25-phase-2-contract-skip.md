# Fase 2 — Contrato omitido

**Change:** gtk-46-gtm-consent-datalayer  
**Fecha:** 2026-07-25

GTK-46 no añade ni modifica Route Handlers ni Server Actions. El mirror cliente usa `POST /api/eventos` con `conversionEventSchema` / `ingestSchema` ya congelados en GTK-32 (`lib/analytics/schema.ts`, `docs/technical/api-spec.yml`).

**Decisión:** fase 2 del harness **omitida** — sin cambios en Zod compartido ni `api-spec.yml`.
