# crm-contacts-leads-projects-pipeline Specification (delta)

## ADDED Requirements

### Requirement: Lectura operativa del pipeline en admin

El dominio CRM SHALL permitir consultas de solo lectura sobre `projects` activos (`deleted_at` IS NULL) desde el portal autenticado, alineadas con `docs/technical/data-model.md` §4.10, sin exponer PII fuera de `/admin`.

#### Scenario: Soft delete respetado en lecturas

- **WHEN** un proyecto tiene `deleted_at` establecido
- **THEN** no aparece en listados ni detalle del pipeline admin
