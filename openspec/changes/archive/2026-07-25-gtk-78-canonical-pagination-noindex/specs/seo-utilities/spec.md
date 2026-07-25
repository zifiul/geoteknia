## ADDED Requirements

### Requirement: Canonical de listados y paginación

El sistema SHALL exponer en `lib/seo/canonical.ts` funciones puras para listados públicos: `buildPaginatedCanonical(siteUrl, basePath, page)` con canonical autoreferenciado (página 1 sin `?page=1`; página N con `?page=N`), `buildListingCanonical` que ignora parámetros de tracking (`utm_*`, `gclid`, `fbclid`, etc.) y no incluye filtros de listado en la URL canónica, y `buildPaginationNavLinks` para URLs absolutas `prev`/`next`. Los filtros SHALL analizarse con helpers documentados sin mezclarlos en el canonical.

#### Scenario: Página 2 autoreferenciada

- **WHEN** `buildPaginatedCanonical` recibe `page: 2` y `basePath: '/blog'`
- **THEN** el canonical absoluto termina en `/blog?page=2`

#### Scenario: UTM no altera canonical de listado

- **WHEN** se deriva el canonical de listado para la misma ruta con `utm_source` en la petición
- **THEN** el canonical coincide con la URL limpia sin parámetros de tracking

### Requirement: Robots de listado y Thank You

`lib/seo/robots-rules.ts` SHALL exponer `resolveListingRobots({ hasActiveFilters, page })` que devuelve `noindex` cuando hay filtros activos no curados y `index` para listados sin filtros (incluida paginación curada). SHALL exponer robots reutilizable `noindex` para Thank You pages (GTK-63).

#### Scenario: Filtros activos en listado

- **WHEN** `hasActiveFilters` es `true`
- **THEN** `resolveListingRobots` devuelve `index: false` y `follow: true`

#### Scenario: Paginación sin filtros

- **WHEN** `hasActiveFilters` es `false` y `page` es mayor que 1
- **THEN** `resolveListingRobots` devuelve `index: true` y `follow: true`

### Requirement: Prev/next en HTML

El change SHALL documentar que la Metadata API de Next.js no emite `rel=prev`/`rel=next` y SHALL proveer un Server Component (`components/seo/pagination-links.tsx`) que renderiza esos `<link>` en el `<head>` vía árbol RSC del layout de listado.

#### Scenario: Enlaces de paginación

- **WHEN** existen URL `prev` y/o `next` calculadas
- **THEN** el componente renderiza `<link rel="prev">` y/o `<link rel="next">` con `href` absoluto

### Requirement: Laboratorio dev-seo y regresiones

El change SHALL extender `app/(public)/dev-seo/` para verificar canonical/robots con UTM, filtros simulados y paginación sin depender de rutas de negocio. SHALL añadir tests que confirmen que `/admin` y contenido `noindex` en sitemap siguen comportamiento GTK-43/GTK-42 sin reimplementación.

#### Scenario: E2E canonical con UTM

- **WHEN** se solicita la ruta de laboratorio con `utm_source`
- **THEN** el HTML incluye `link[rel=canonical]` sin parámetros UTM
