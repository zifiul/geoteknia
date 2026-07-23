# Design — gtk-8-accreditations-tenders-support

> Variante Harness DB — `accreditations`, `contractor_classifications`, `public_organism_experience` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`Accreditation`:** credenciales RF-12 con bloque EDITORIAL/AUDIT; `valid_until` como `@db.Date`; `logo_id` y `document_id` UUID opcionales sin FK Prisma (patrón media lógica).
2. **`ContractorClassification`:** maestro RF-15 con grupo/subgrupo indexados compuestamente; solo bloque AUDIT.
3. **`PublicOrganismExperience`:** experiencia RF-15 con FK opcional a `case_studies` (`onDelete: SetNull`); índice en `organism_type`.
4. **Back-relation:** `publicOrganismExperience PublicOrganismExperience[]` en `CaseStudy`.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `onDelete: SetNull` en `related_case_id` | Cascade | Preservar experiencia si se retira un caso |
| Sin FK Prisma en `logo_id` / `document_id` | FK a `media_assets` | Consistencia con `hero_image_id` en otras entidades |
| Bloque EDITORIAL en `accreditations` | Solo AUDIT | Contenido publicable en `/licitaciones/` |
| Sin seed | Seed inline | Datos reales pendientes del cliente |

## Migración

- Nombre: `accreditations_tenders_support`
- DDL: enums `CredentialType`, `OrganismType`; 3 tablas; FK `public_organism_experience.related_case_id` → `case_studies`
- Índices: `credential_type`, `(group_code, subgroup_code)`, `organism_type`
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — datos corporativos (credenciales, registros, organismos) |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | No se usan en prompts Claude (RNF-IA) |
| Caducidad | `valid_until` Date para control de vigencia |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
