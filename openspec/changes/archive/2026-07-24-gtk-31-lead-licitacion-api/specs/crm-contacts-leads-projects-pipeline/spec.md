# crm-contacts-leads-projects-pipeline — Delta (GTK-31)

## MODIFIED Requirements

### Requirement: Alta de proyecto desde lead

`createProjectFromLead` SHALL aceptar opcionalmente `expedienteRef` y `estimatedValue` y persistirlos en `projects.expediente_ref` y `projects.estimated_value` cuando se proporcionen, sin alterar el comportamiento de GTK-28/29 cuando no se pasan.

#### Scenario: Proyecto con expediente e importe

- **WHEN** el caso de uso invoca `createProjectFromLead` con `expedienteRef` e `estimatedValue`
- **THEN** el registro `project` creado incluye esos valores en las columnas correspondientes

#### Scenario: Proyecto presupuesto sin campos nuevos

- **WHEN** `createBudgetLead` invoca `createProjectFromLead` sin `expedienteRef` ni `estimatedValue`
- **THEN** el proyecto se crea igual que antes (campos null)
