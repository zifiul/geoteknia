# admin-crm-project-detail-ui (delta)

## ADDED Requirements

### Requirement: Detalle de proyecto editable

El portal SHALL mostrar en `/admin/proyectos/[id]` lead, contacto, tipo/origen de lead, estado, técnico, hitos, notas, documentos e historial de estado, con controles de mutación acordes al RBAC.

#### Scenario: Gestor ve ficha completa

- **WHEN** un usuario con `projects.read` abre un proyecto existente
- **THEN** ve datos de lead/contacto y secciones de hitos, notas y documentos con su contenido

#### Scenario: Cambio de estado válido

- **WHEN** un usuario con `projects.update` confirma un cambio de estado permitido
- **THEN** la Server Action `changeStateAction` persiste el cambio y la UI refleja el nuevo estado tras refresco

#### Scenario: Técnico sin asignar ni borrar

- **WHEN** un usuario con rol `tecnico` abre un proyecto asignado
- **THEN** no ve controles de reasignación de técnico ni de borrado de notas/documentos
- **AND** puede cambiar estado y añadir hitos/notas/documentos si tiene `projects.update`

### Requirement: Accesibilidad y estados de UI

La ficha SHALL exponer estados de carga (skeleton), guardado (`aria-busy`), éxito (`role="status"`) y error accesible; modales de confirmación con foco gestionado (Radix Dialog).

#### Scenario: Confirmación de borrado

- **WHEN** un gestor inicia el borrado de una nota
- **THEN** debe confirmar en un diálogo modal accesible antes de invocar `deleteNoteAction`
