# Code Review — GTK-8 Acreditaciones y soporte de licitaciones

**Fecha:** 2026-07-23  
**Change:** `gtk-8-accreditations-tenders-support`  
**Revisor:** agente (Harness DB)

## Alcance revisado

- `prisma/schema.prisma` — enums `CredentialType`, `OrganismType`; modelos `Accreditation`, `ContractorClassification`, `PublicOrganismExperience`; back-relation en `CaseStudy`
- `prisma/migrations/20260723180000_accreditations_tenders_support/migration.sql`
- Artefactos OpenSpec del change

## Checklist schema

| Criterio | Estado |
|----------|--------|
| UUID en PKs | ✅ |
| Modelos alineados con `data-model.md` §4.8 | ✅ |
| Bloque EDITORIAL en `accreditations` | ✅ |
| Bloque AUDIT en las tres entidades | ✅ |
| `workflow_status` default `borrador_ia` | ✅ |
| `valid_until` como `@db.Date` | ✅ |
| FK `related_case_id` ON DELETE SET NULL | ✅ |
| Índices declarados en ticket | ✅ |
| `logo_id` / `document_id` sin FK Prisma (patrón media lógica) | ✅ |
| Sin seed en este ticket | ✅ |

## Seguridad

- `reports/security.md` sin hallazgos bloqueantes.
- Sin PII; datos corporativos documentados en threat model.

Veredicto: APTO
