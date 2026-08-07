# public-machinery-listing — Delta MODIFIED

> GTK-57 (extensión)

## MODIFIED Requirements

### Requirement: Listado publicado de maquinaria

El sistema SHALL exponer la ruta `/maquinaria` como página RSC que lista únicamente equipos con `PUBLISHED_EDITORIAL_WHERE`, ordenados por nombre ascendente. Cada ficha del listado SHALL enlazar a su ficha individual en `/maquinaria/[slug]`.

#### Scenario: Equipos publicados visibles

- **WHEN** existen registros `machinery` en estado `publicado` y no borrados
- **THEN** la página muestra una ficha por equipo con specs y el título enlaza a `/maquinaria/{slug}`
