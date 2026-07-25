# public-service-page Specification

## Purpose

Plantilla dinámica del silo de servicios (`/servicios`, `/servicios/[slug]`): contenido CMS publicado, JSON-LD `Service` extendido, enlaces internos a casos y geo-landings, CTA de presupuesto y tracking de engagement. Materializado con GTK-49.

## Requirements

### Requirement: Rutas de servicio publicadas

El sistema SHALL exponer `/servicios` y `/servicios/[slug]` solo para servicios con `workflowStatus: publicado` y `deletedAt: null`.

#### Scenario: Slug no publicado

- **WHEN** se solicita un slug inexistente o no publicado
- **THEN** la respuesta es HTTP 404 vía `notFound()`

#### Scenario: SSG

- **WHEN** se construye el sitio
- **THEN** `generateStaticParams` usa `listPublishedServices()` para cada slug publicado

### Requirement: SEO y JSON-LD

La plantilla SHALL emitir metadata vía `buildMetadata(siteUrl, 'service', …)`, `BreadcrumbList` y `Service` con `serviceType`, `provider` y `areaServed` cuando existan datos.

### Requirement: Contenido CMS y enlaces internos

La página SHALL renderizar body, metodología, normativa, entregables, maquinaria, FAQs, casos y enlaces a `service_zone_pages` publicadas; las secciones vacías SHALL omitirse.

### Requirement: CTA presupuesto

El CTA SHALL enlazar a `/presupuesto?servicio={slug}` y usar barra sticky en móvil.
