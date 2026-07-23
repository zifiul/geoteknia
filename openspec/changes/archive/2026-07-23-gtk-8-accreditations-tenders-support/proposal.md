# Proposal — gtk-8-accreditations-tenders-support

> US: [GTK-8 — Acreditaciones y soporte de licitaciones](https://linear.app/geoteknia/issue/GTK-8/acreditaciones-y-soporte-de-licitaciones)
> Variante: **Harness DB** | Dependencias: GTK-6, GTK-7, GTK-9, GTK-20 | Desbloquea: páginas `/licitaciones/`

## Why

Las entidades de solvencia para obra pública — `accreditations`, `contractor_classifications` y `public_organism_experience` — sustentan credenciales verificables y experiencia con la Administración. Materializa RF-12 (acreditaciones) y RF-15 (licitaciones), entidades 11, 12 y 13 del modelo.

## What Changes

- Crear enums `CredentialType` y `OrganismType`.
- Crear modelos `Accreditation`, `ContractorClassification` y `PublicOrganismExperience`.
- Añadir back-relation `publicOrganismExperience` en `CaseStudy`.
- Migración `accreditations_tenders_support` (DDL-only, sin data migration).

## Capabilities

### New Capabilities

- `accreditations-tenders-support`: credenciales corporativas, clasificación de contratista y experiencia con organismos públicos.

### Modified Capabilities

- `case-studies-team-machinery`: back-relation `publicOrganismExperience` en `CaseStudy`.

## Impact

- **Código:** `prisma/schema.prisma`, migración SQL.
- **BD:** tres tablas + dos enums en Neon EU.
- **API / UI:** ninguno (fases 2 y 4b omitidas).
- **RGPD:** sin PII (datos corporativos).
- **Seed:** pendiente de datos reales del cliente (DB-14).

## Fuera de alcance

- Seed de acreditaciones y clasificaciones reales.
- FKs duras de `logo_id` / `document_id` a `media_assets` (UUID lógicos, patrón `hero_image_id`).
- Lógica de dominio en `/lib/`.
