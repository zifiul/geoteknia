# crm-contacts-leads-projects-pipeline — Delta (GTK-29)

## MODIFIED Requirements

### Requirement: Upsert de contacto en captación pública

El pipeline de captación SHALL usar un helper compartido `upsertContact` que deduplica por email OR teléfono (`deleted_at IS NULL`) y rellena solo los campos presentes (`full_name`, `email`, `phone`, `company`, `professional_role`, `province_id` opcionales).

#### Scenario: Contacto mínimo solo teléfono

- **WHEN** `createLocationLead` recibe solo teléfono sin nombre ni rol
- **THEN** se crea o actualiza `contacts` con `phone` y columnas opcionales en null sin exigir `full_name` ni `professional_role`

### Requirement: Título de proyecto parametrizable

`createProjectFromLead` SHALL aceptar un prefijo de título (p. ej. `Presupuesto` o `Ubicación`) para generar `projects.title` cuando `service` y/o `province` son null.

#### Scenario: Proyecto desde lead de ubicación

- **WHEN** se crea project desde lead `ubicacion` sin `service_id`
- **THEN** el título comienza con el prefijo `Ubicación` y sigue siendo NOT NULL
