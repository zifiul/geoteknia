# admin-crm-pipeline-ui (delta GTK-70)

## ADDED Requirements

### Requirement: UI pipeline en /admin/proyectos

El portal SHALL renderizar el pipeline con componentes del design system: filtros en URL, panel de métricas (excepto rol técnico), vista tablero o lista según `view`, y enlaces al detalle.

#### Scenario: Vista por defecto gestor

- **WHEN** un gestor visita `/admin/proyectos` sin `view`
- **THEN** se muestra el tablero kanban con columnas por estado

#### Scenario: Técnico scoped

- **WHEN** un técnico visita `/admin/proyectos`
- **THEN** solo ve lista de sus proyectos, sin métricas globales ni tablero

#### Scenario: Tarjeta con contexto lead

- **WHEN** se lista un proyecto con lead asociado
- **THEN** la fila/tarjeta muestra tipo de lead, origen y antigüedad

### Requirement: Cambio de estado desde tablero

Usuarios con `projects.update` (admin/gestor en tablero) SHALL poder mover tarjetas invocando `changeStateAction`; transición inválida muestra error accesible sin romper el layout.

#### Scenario: Alternativa teclado

- **WHEN** el usuario no usa arrastre
- **THEN** puede cambiar estado desde un menú/select en la tarjeta
