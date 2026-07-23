# accreditations-tenders-support — Delta Spec

## ADDED Requirements

### Requirement: Enum CredentialType

El schema SHALL declarar el enum `CredentialType` con valores `enac`, `iso`, `registro_ministerio`, `clasificacion_contratista`, `seguro_rc`, `asociacion`.

#### Scenario: Clasificación de credencial

- **WHEN** se crea un registro `accreditations` con `credential_type='enac'`
- **THEN** Prisma valida el valor contra el enum `CredentialType`

### Requirement: Enum OrganismType

El schema SHALL declarar el enum `OrganismType` con valores `ministerio`, `confederacion`, `puerto`, `ayuntamiento`, `otro`.

#### Scenario: Tipo de organismo público

- **WHEN** se crea un registro `public_organism_experience` con `organism_type='ministerio'`
- **THEN** Prisma valida el valor contra el enum `OrganismType`

### Requirement: Tabla accreditations

El schema SHALL incluir `Accreditation` con bloques EDITORIAL/AUDIT, `valid_until` como `@db.Date`, índice en `credential_type` y referencias lógicas `logo_id` / `document_id` sin FK Prisma.

#### Scenario: Default editorial en acreditación

- **WHEN** se crea una acreditación sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

#### Scenario: Caducidad como Date

- **WHEN** se inspecciona la migración
- **THEN** `accreditations.valid_until` es de tipo `DATE` (no timestamp)

#### Scenario: Índice por tipo de credencial

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `accreditations.credential_type`

### Requirement: Tabla contractor_classifications

El schema SHALL incluir `ContractorClassification` con índice compuesto en `(group_code, subgroup_code)` y bloque AUDIT.

#### Scenario: Índice compuesto grupo/subgrupo

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `(group_code, subgroup_code)`

### Requirement: Tabla public_organism_experience

El schema SHALL incluir `PublicOrganismExperience` con FK opcional a `case_studies` (`onDelete: SetNull`), índice en `organism_type` y bloque AUDIT.

#### Scenario: FK a case_studies con set null

- **WHEN** se inspecciona la migración
- **THEN** `public_organism_experience.related_case_id` referencia `case_studies.id` con `ON DELETE SET NULL`

#### Scenario: Back-relation en CaseStudy

- **WHEN** se inspecciona el schema Prisma
- **THEN** `CaseStudy` declara `publicOrganismExperience PublicOrganismExperience[]`
