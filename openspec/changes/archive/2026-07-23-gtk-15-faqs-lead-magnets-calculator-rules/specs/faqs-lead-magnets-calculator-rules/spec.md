# faqs-lead-magnets-calculator-rules — Delta Spec

## ADDED Requirements

### Requirement: Enum FaqScope

El schema SHALL declarar el enum `FaqScope` con valores `general` y `service`.

#### Scenario: Clasificación de grupo FAQ

- **WHEN** se crea un registro `faq_groups` con `scope='service'`
- **THEN** Prisma valida el valor contra el enum `FaqScope`

### Requirement: Tabla faq_groups

El schema SHALL incluir `FaqGroup` con FK opcional a `services` (`onDelete: SetNull`); bloque SEO (slug único, schema_type); bloque AUDIT; índice en `service_id`.

#### Scenario: Slug único de grupo FAQ

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `faq_groups.slug`

### Requirement: Tabla faqs

El schema SHALL incluir `Faq` con FK cascade a `faq_groups`; bloque EDITORIAL completo; bloque AUDIT; índices en `faq_group_id` y `workflow_status`.

#### Scenario: Default editorial en FAQ

- **WHEN** se crea una FAQ sin especificar `workflow_status`
- **THEN** el valor por defecto es `borrador_ia`

#### Scenario: Cascade al borrar grupo

- **WHEN** se inspecciona la migración
- **THEN** `faqs.faq_group_id` referencia `faq_groups.id` con `ON DELETE CASCADE`

### Requirement: Tabla lead_magnets

El schema SHALL incluir `LeadMagnet` con `file_id` UUID obligatorio, `thank_you_url` obligatorio, `is_gated` default `true`; bloques SEO/EDITORIAL/AUDIT completos; FK opcional a `services` (`onDelete: SetNull`); índice en `service_id`.

#### Scenario: is_gated por defecto true

- **WHEN** se crea un lead magnet sin especificar `is_gated`
- **THEN** el valor por defecto es `true`

#### Scenario: Slug único de lead magnet

- **WHEN** se inspecciona la migración
- **THEN** existe índice único btree en `lead_magnets.slug`

### Requirement: Tabla calculator_rules

El schema SHALL incluir `CalculatorRule` con FK cascade a `work_typologies`; `boreholes_formula` JSON obligatorio; `is_active` default `true`; índices en `work_typology_id`, `is_active` y compuesto `(work_typology_id, is_active)`.

#### Scenario: boreholes_formula obligatorio

- **WHEN** se inspecciona el schema Prisma
- **THEN** `CalculatorRule.boreholesFormula` es `Json` sin modificador opcional

#### Scenario: is_active por defecto true

- **WHEN** se crea una regla sin especificar `is_active`
- **THEN** el valor por defecto es `true`

#### Scenario: Índice compuesto para regla activa

- **WHEN** se inspecciona la migración
- **THEN** existe índice btree en `(calculator_rules.work_typology_id, calculator_rules.is_active)`

### Requirement: Back-relations

El schema SHALL incluir `faqGroups` y `leadMagnets` en `Service`; `calculatorRules` en `WorkTypology`.

#### Scenario: Relación servicio a FAQs

- **WHEN** se inspecciona el schema Prisma
- **THEN** `Service` declara `faqGroups FaqGroup[]` y `leadMagnets LeadMagnet[]`

#### Scenario: Relación tipología a reglas

- **WHEN** se inspecciona el schema Prisma
- **THEN** `WorkTypology` declara `calculatorRules CalculatorRule[]`
