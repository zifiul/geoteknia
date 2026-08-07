# public-machinery-detail Specification

## Purpose

Ficha pública individual de equipamiento geotécnico en `/maquinaria/[slug]`: especificaciones técnicas, servicios vinculados, SEO sintético e ISR. Extiende GTK-57 (listado) cerrando URLs ya emitidas por sitemap y revalidación.

## Requirements

### Requirement: Ficha publicada por slug

El sistema SHALL exponer `/maquinaria/[slug]` como RSC que renderiza un equipo con `PUBLISHED_EDITORIAL_WHERE`, incluyendo specs, foto, servicios vinculados y CTA a contacto.

#### Scenario: Equipo publicado

- **WHEN** existe `machinery` publicado con el slug solicitado
- **THEN** la página muestra nombre, tipo, `SpecTable`, servicios y foto con `alt`

#### Scenario: Slug no publicado o inexistente

- **WHEN** el slug no existe, está en borrador o borrado lógicamente
- **THEN** la respuesta es HTTP 404

### Requirement: SEO sintético e ISR

La página SHALL usar `revalidate = 3600`, `generateStaticParams` desde equipos publicados, metadata derivada del nombre y tipo (`buildMachinerySeoBlock`) y canonical autoreferenciado.

#### Scenario: Metadata

- **WHEN** se solicita un slug publicado
- **THEN** `generateMetadata` devuelve title/description truncados y canonical a `/maquinaria/{slug}`

### Requirement: JSON-LD Product y BreadcrumbList

La ficha SHALL incluir `BreadcrumbList` (Inicio > Maquinaria > equipo) y `Product` con `additionalProperty` para specs técnicas.

#### Scenario: Schemas presentes

- **WHEN** se renderiza una ficha publicada
- **THEN** existen bloques JSON-LD `@type: Product` y `@type: BreadcrumbList`

### Requirement: Enlaces desde listado y servicios

Las fichas del listado `/maquinaria` y la sección Equipamiento en servicios SHALL enlazar a `/maquinaria/[slug]`.

#### Scenario: Enlace desde listado

- **WHEN** el usuario ve una `MachineCard` en `/maquinaria`
- **THEN** el título enlaza a la ficha individual del equipo
