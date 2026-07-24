# crm-contacts-leads-projects-pipeline — Delta (GTK-28)

## ADDED Requirements

### Requirement: Alta automática lead y proyecto vía captación pública

Además del schema Prisma existente, el sistema SHALL permitir crear en runtime un par `Lead` + `Project` 1:1 desde el endpoint público de presupuesto: `lead_type=presupuesto`, `channel=formulario`, `project.state_id` apuntando al `ProjectState` con `is_initial=true` (seed `lead-nuevo`), sin insertar fila en `project_state_history` en el alta anónima.

#### Scenario: Proyecto en estado inicial

- **WHEN** se completa un POST de presupuesto válido
- **THEN** existe exactamente un `projects` con `lead_id` único del lead creado y `state.slug='lead-nuevo'`

#### Scenario: Deduplicación de contacto

- **WHEN** ya existe un `contacts` con el mismo `email` o `phone` y `deleted_at IS NULL`
- **THEN** el nuevo lead se asocia a ese contacto y se rellenan campos vacíos del contacto sin duplicar fila
