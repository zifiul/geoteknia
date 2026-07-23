# Informe — GTK-8 — tests unitarios y verificación BD

**Fecha:** 2026-07-23  
**Change:** `gtk-8-accreditations-tenders-support`  
**Variante:** Harness DB

## Tests unitarios

| Comando | Resultado |
|---------|-----------|
| `npm run test` | ✅ 13/13 tests (4 archivos) |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |

## Prisma

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma generate` | ✅ Cliente generado con `Accreditation`, `ContractorClassification`, `PublicOrganismExperience` |
| Migración `20260723180000_accreditations_tenders_support` | ✅ Creada localmente |
| `npx prisma migrate deploy` | ✅ Migración `accreditations_tenders_support` aplicada en Neon EU |

## Criterios de aceptación GTK-8

| Criterio | Estado |
|----------|--------|
| Enum `CredentialType` con 6 valores | ✅ |
| Enum `OrganismType` con 5 valores | ✅ |
| `accreditations.valid_until` tipo `DATE` | ✅ |
| Índice `accreditations.credential_type` | ✅ |
| Índice compuesto `contractor_classifications(group_code, subgroup_code)` | ✅ |
| Índice `public_organism_experience.organism_type` | ✅ |
| FK `related_case_id` → `case_studies` ON DELETE SET NULL | ✅ |
| Back-relation `publicOrganismExperience` en `CaseStudy` | ✅ |
| Bloque EDITORIAL en `accreditations` | ✅ |
| Sin seed (datos pendientes del cliente) | ✅ |

## Verificación BD (`db-state-verify`)

Migración DDL-only (CREATE); sin seed ni datos de prueba insertados. No requiere restauración de línea base.

## Restauración

Sin operaciones de datos de prueba; no requiere restauración.
