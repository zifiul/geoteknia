# public-home-page Specification

## Purpose

Plantilla de inicio del sitio público B2B: propuesta de valor, recorridos por buyer persona, servicios y prueba social solo publicados, metadata de marca y JSON-LD `ProfessionalService` extendido. Materializado con GTK-48.

## Requirements

### Requirement: Home pública con propuesta de valor y un solo h1

La ruta `/` SHALL renderizar en servidor (SSG/ISR) secciones de hero, recorridos por persona, servicios publicados, prueba social y CTA final. SHALL existir exactamente un `h1` visible. Si una sección dinámica no tiene datos publicados, SHALL omitirse sin placeholders rotos.

#### Scenario: Home sin casos publicados

- **WHEN** no hay casos de estudio con `workflowStatus: publicado`
- **THEN** la página responde 200 y la sección de casos no se renderiza

### Requirement: JSON-LD ProfessionalService extendido

La home SHALL incluir un único script `application/ld+json` construido con `buildLocalBusinessSchema()` extendido (`name`, NAP, `areaServed` multivalor, `hasOfferCatalog` con servicios publicados, `useProfessionalService: true`). Campos ausentes SHALL omitirse (no `null`). `aggregateRating` SHALL emitirse solo si existen `ratingValue` y `reviewCount` verificables.

#### Scenario: Schema con catálogo de servicios

- **WHEN** hay al menos un servicio publicado
- **THEN** el JSON-LD incluye `hasOfferCatalog.itemListElement` referenciando esos servicios

### Requirement: Recorridos por persona con silos canónicos

Al menos tres recorridos SHALL enlazar mediante `buildSiloPath` o rutas de listado documentadas (`/acreditaciones`, `/servicios`) sin slugs hardcodeados inventados. Los CTAs de navegación interna SHALL registrar `select_content` en dataLayer sin POST a `/api/eventos`.

#### Scenario: CTA persona navega a silo

- **WHEN** el visitante activa el CTA principal de un recorrido
- **THEN** la URL destino coincide con el silo configurado en servidor

### Requirement: Metadata de marca en raíz

`generateMetadata` de la home SHALL fijar `canonical` absoluto a `/`, `robots: index,follow`, título y descripción de marca, y Open Graph, sin usar `buildMetadata()` de entidad CMS.

#### Scenario: Canonical raíz

- **WHEN** se inspecciona el HTML de `/`
- **THEN** existe `link rel="canonical"` apuntando al origen del sitio sin path adicional

### Requirement: CTAs de contacto con pipeline de conversión

Teléfono, WhatsApp y email desde la home SHALL usar `trackConversionEvent` / eventos canónicos `click_tel`, `click_whatsapp`, `click_email`.

#### Scenario: Clic teléfono en CTA final

- **WHEN** el usuario con consentimiento de analítica pulsa un enlace `tel:` de la home
- **THEN** se empuja `click_tel` al dataLayer
