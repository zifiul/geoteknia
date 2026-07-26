# Proposal — gtk-58-licitaciones

> US: [GTK-58 — Página de licitaciones y obra pública con formulario de expediente](https://linear.app/geoteknia/issue/GTK-58/pagina-de-licitaciones-y-obra-publica-con-formulario-de-expediente)
> Diseño Stitch (comentario Linear 2026-07-19): proyecto `9787207935189076711`, DS `3480174961756698237` — `/licitaciones` desktop `6c73d5f0bcaa4ef4a4cba6ad1f0e60d8`, mobile `cd78e0e038bc4d508d1e2d136d0459cb`.
> Backend lead: `POST /api/leads/licitacion` (GTK-31, cerrado). Thank you: `/gracias/licitacion` (GTK-63).

## Why

Captar el segmento de subcontratación geotécnica en obra pública exige una página de solvencia (clasificación de contratista, experiencia con organismos, casos enlazados) y un formulario con referencia de expediente o URL de plataforma, materializando RF-15 y US-11 (P3).

## What Changes

- Ruta RSC `app/(public)/licitaciones/page.tsx` (SSG + ISR), metadata estática, canonical `/licitaciones`, JSON-LD `BreadcrumbList`.
- Lectores públicos `listContractorClassifications()` y `listPublicOrganismExperience()` en `lib/content/tenders.ts` (datos vía seed Prisma — opción A; sin CRUD admin).
- Organismos `ClassificationTable`, `PublicProjects`, `TenderForm` (cliente) validando con `tenderLeadSchema`, Turnstile, `POST /api/leads/licitacion`, redirección 201 → `/gracias/licitacion?ref=...`.
- Enlace a `/acreditaciones` (destino GTK-59 pendiente).
- Analítica: `form_start`, `form_step` (dataLayer), `generate_lead` con `leadType: licitacion` tras 201.
- Tests Vitest (lectores + validación formulario) y E2E Playwright del flujo de envío.

## Capabilities

### New Capabilities

- `public-tenders-page`: página pública `/licitaciones` con contenido de solvencia, formulario de lead de licitación y SEO/analítica asociados.

### Modified Capabilities

- Ninguna spec viva fuera del delta del change.

## Impact

- **Contrato API:** sin cambios (reutiliza `tenderLeadSchema` y handler GTK-31).
- **Datos:** seed idempotente de `contractor_classifications` y `public_organism_experience` en `prisma/seed.ts` (sin migración nueva).
- **SEO/RGPD:** metadata estática; PII solo en envío al endpoint ya existente; Turnstile en cliente.
- **QA:** E2E obligatorio (label `Frontend`).

## Fuera de alcance

- CRUD admin de clasificación/experiencia (sub-ticket backend futuro).
- Página `/acreditaciones` (GTK-59).
- Lighthouse CI formal (GTK-77).
