# public-machinery-listing (delta GTK-57)

## ADDED Requirements

### Requirement: Listado publicado de maquinaria

El sistema SHALL exponer la ruta `/maquinaria` como página RSC que lista únicamente equipos con `PUBLISHED_EDITORIAL_WHERE`, ordenados por nombre ascendente.

#### Scenario: Equipos publicados visibles

- **WHEN** existen registros `machinery` en estado `publicado` y no borrados
- **THEN** la página muestra una ficha por equipo con `equipmentType`, `model`, `maxDepthM`, `diameters`, `inSituTests` parseado, `hasEnacLab`, foto con `alt` y enlaces a servicios publicados vinculados vía `machinery_services`

#### Scenario: Sin equipos publicados

- **WHEN** no hay maquinaria publicada
- **THEN** la página muestra estado vacío con CTA a `/contacto`

### Requirement: Contrato de ensayos in situ

El sistema SHALL tipar `machinery.in_situ_tests` como array de códigos de ensayo conocidos (`SPT`, `DPSH`, `Lefranc`, `Lugeon`, `presiometro`, `penetrometro`) con parser tolerante a JSON inválido o vacío (render sin fila de ensayos).

#### Scenario: JSON válido

- **WHEN** `in_situ_tests` es `["SPT","DPSH"]`
- **THEN** la ficha muestra la fila «Ensayos in situ» con etiquetas legibles

#### Scenario: JSON inválido

- **WHEN** `in_situ_tests` no cumple el schema
- **THEN** `listPublishedMachinery()` devuelve `inSituTests: null` sin error

### Requirement: SEO del listado

La página SHALL publicar metadata estática (`title`, `description`), `canonical` autoreferenciado a `/maquinaria`, `robots: index,follow` y JSON-LD `BreadcrumbList` con segmentos Inicio y Maquinaria.

#### Scenario: Metadata estática

- **WHEN** se solicita `/maquinaria`
- **THEN** `generateMetadata` fija canonical a `{SITE_URL}/maquinaria` sin query params

### Requirement: Accesibilidad y responsive

Las fichas SHALL usar grid 1/2/3 columnas (mobile-first). La tabla de especificaciones SHALL ser una `<table>` con `<caption>`, `<th scope="row">` y contenedor con scroll horizontal accesible en viewports estrechos.

#### Scenario: Tabla de specs

- **WHEN** un equipo tiene al menos un campo técnico
- **THEN** `SpecTable` renderiza `<table>` con `<th scope="row">` por fila

### Requirement: Analítica

Los enlaces a servicios desde cada ficha SHALL disparar `select_content` vía `pushRawDataLayer` sin POST a `/api/eventos`. La página SHALL registrar `scroll_depth` con el pipeline canónico de conversión (GTK-46).

#### Scenario: Clic en servicio

- **WHEN** el usuario hace clic en un enlace a servicio con consentimiento de analítica
- **THEN** se empuja `select_content` al dataLayer

### Requirement: Compatibilidad GTK-49

`listMachineryByService()` y `PublishedMachineryListItem` SHALL permanecer sin cambios de firma ni comportamiento.

#### Scenario: Servicio sin regresión

- **WHEN** se invoca `listMachineryByService(serviceId)` tras este change
- **THEN** la forma del resultado sigue siendo `PublishedMachineryListItem[]` ligero
