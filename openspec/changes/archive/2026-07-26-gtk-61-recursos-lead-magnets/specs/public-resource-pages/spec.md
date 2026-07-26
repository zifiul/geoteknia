# Delta spec — public-resource-pages

## ADDED Requirements

### Requirement: Catálogo público de recursos gated

El sistema SHALL exponer `/recursos` listando lead magnets con `workflowStatus: publicado`, `deletedAt: null` e `isGated: true`, ordenados por título, con portada resuelta desde `og_image_id`.

#### Scenario: Listado con recursos publicados

- **WHEN** existen lead magnets publicados y gated
- **THEN** la página muestra tarjetas enlazando a `/recursos/[slug]` con título y descripción breve

#### Scenario: Catálogo vacío

- **WHEN** no hay recursos que cumplan el filtro
- **THEN** se muestra estado vacío accesible sin error 500

### Requirement: Ficha de recurso con formulario gated

El sistema SHALL servir `/recursos/[slug]` para slugs publicados y gated con metadata SEO (`buildMetadata`), `BreadcrumbList` JSON-LD, enlace opcional al servicio relacionado y formulario que valida con `resourceLeadSchema`.

#### Scenario: Slug inexistente o no publicado

- **WHEN** el slug no existe o no está publicado
- **THEN** la respuesta es HTTP 404 (`notFound()`)

#### Scenario: Envío válido

- **WHEN** el usuario envía el formulario con Turnstile y datos válidos
- **THEN** el cliente llama `POST /api/recursos/[slug]`, recibe 201 y redirige a Thank You con `ref` y `download` sanitizados

### Requirement: Descarga protegida de fichero

El sistema SHALL implementar `GET /api/recursos/download?token=` decodificando `base64url(leadId:leadMagnetId)`, verificando que el lead existe y coincide con el magnet, y redirigiendo al fichero sin devolver `file_url` en cuerpo JSON.

#### Scenario: Token válido

- **WHEN** el token corresponde a un lead existente con `leadMagnetId` coherente
- **THEN** la respuesta es redirección al PDF (3xx) sin JSON con URL interna

#### Scenario: Token inválido

- **WHEN** el token está malformado o el lead no existe
- **THEN** la respuesta es 400 o 404 según el caso, sin filtrar rutas de almacenamiento

### Requirement: Seguimiento sin duplicar conversión

El frontend SHALL emitir `form_start` en dataLayer al iniciar el formulario y SHALL NOT volver a registrar `resource_download` (ya lo hace `createResourceLead`).

#### Scenario: Inicio de formulario

- **WHEN** el usuario interactúa por primera vez con el formulario de recurso
- **THEN** se emite `form_start` en dataLayer y no se llama a `trackConversionEvent` con `resource_download`
