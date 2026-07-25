# Delta spec — seo-utilities

## ADDED Requirements

### Requirement: Builders JSON-LD tipados por SchemaType

El sistema SHALL exponer en `lib/seo/jsonld.ts` funciones builder para cada valor del enum `SchemaType` de `data-model.md`: `Service`, `LocalBusiness` (y subtipo `ProfessionalService` cuando aplique), `Article`, `CreativeWork`, `Person`, `Organization` (con `hasCredential` desde `accreditations`), `FAQPage` y `BreadcrumbList`. Cada builder SHALL aceptar datos de dominio/CMS sin acoplar a una página concreta y SHALL omitir propiedades opcionales cuando el dato falta (sin `null` explícitos en el JSON).

#### Scenario: Service sin imagen opcional

- **WHEN** `buildServiceSchema` recibe un servicio sin URL de imagen
- **THEN** el objeto JSON-LD no incluye la propiedad `image`

#### Scenario: Person con works_for y alumni_of

- **WHEN** `buildPersonSchema` recibe `works_for` y `alumni_of` de `team_members`
- **THEN** el JSON-LD incluye esas propiedades Schema.org sin reasignar nombres

#### Scenario: Organization con hasCredential

- **WHEN** `buildOrganizationSchema` recibe filas de `accreditations` con `name`, `credential_type`, `issuer`, `registration_number`, `verification_url`, `valid_until`
- **THEN** el JSON-LD incluye `hasCredential` mapeado desde esos campos

### Requirement: buildMetadata centralizado

La función `buildMetadata()` en `lib/seo/metadata.ts` SHALL aceptar el Bloque SEO (`seoBlockSchema` / `SeoBlockInput`), `siteUrl`, `kind` (`SitemapPriorityKind`) y `row` para canonical, y SHALL devolver un objeto `Metadata` de Next.js con `title`, `description`, `alternates.canonical`, `robots` y Open Graph. SHALL reutilizar `resolveMetadataBase(siteUrl)` para `metadataBase` y `resolveContentUrl` para canonical absoluto. SHALL truncar o validar `meta_title` ≤ 60 y `meta_description` ≤ 155 caracteres.

#### Scenario: noindex por Bloque SEO

- **WHEN** el Bloque SEO trae `noindex: true`
- **THEN** `buildMetadata` devuelve `robots` con indexación deshabilitada

#### Scenario: Canonical delega en resolveContentUrl

- **WHEN** el row tiene `canonical_url` explícito
- **THEN** `alternates.canonical` coincide con esa URL sin reconstruir silo

### Requirement: BreadcrumbList desde silo

`lib/seo/breadcrumbs.ts` SHALL construir la jerarquía de `BreadcrumbList` usando `buildSiloPath` y los `SitemapPriorityKind` de `sitemap-config.ts`, cubriendo rutas `/servicios/`, `/zonas/`, `/proyectos/`, `/blog/[categoria]/[slug]` y demás kinds del silo.

#### Scenario: blog_post requiere categorySlug

- **WHEN** se construyen breadcrumbs para `blog_post` sin `categorySlug`
- **THEN** la función falla con error explícito o no emite URL incompleta (alineado con `buildSiloPath`)

### Requirement: Escapado seguro para script JSON-LD

`lib/seo/json-ld-escape.ts` SHALL escapar el resultado de `JSON.stringify` para inyección en `<script type="application/ld+json">`, evitando ruptura del DOM por `</script>` y caracteres peligrosos. No SHALL reutilizar `escapeXml` de `xml-escape.ts`.

#### Scenario: Payload con cierre de script

- **WHEN** un string dinámico contiene la secuencia `</script>`
- **THEN** el escapado produce contenido seguro que no cierra el elemento script en HTML

### Requirement: Componente RSC JsonLd

`components/seo/json-ld.tsx` SHALL ser Server Component (sin `'use client'`), SHALL renderizar un único `<script type="application/ld+json">` por instancia con datos serializados y escapados, y no SHALL usar `dangerouslySetInnerHTML` en el cliente.

#### Scenario: Un script por bloque

- **WHEN** la página renderiza un `<JsonLd data={schema} />`
- **THEN** el HTML servido contiene exactamente un `<script type="application/ld+json">` para ese bloque

### Requirement: Página de prueba para verificación

El change SHALL incluir una ruta pública de prueba (bajo `(public)`) que demuestra `buildMetadata`, `<JsonLd>` y datos con caracteres peligrosos, para E2E y validación manual de schema.

#### Scenario: view-source sin ejecución de script inyectado

- **WHEN** la página de prueba incluye datos con `</script>` en campos de prueba
- **THEN** el HTML en `view-source` no interpreta ese contenido como cierre de script malicioso

### Requirement: Tests unitarios por builder y helper

El proyecto SHALL incluir tests Vitest en `tests/unit/seo/` para cada builder principal, `buildMetadata`, `breadcrumbs` y `json-ld-escape`, siguiendo el patrón de `silo-urls.test.ts` y `site-url.test.ts`.

#### Scenario: Suite seo en CI

- **WHEN** se ejecuta `pnpm run test` con los nuevos archivos
- **THEN** los tests de `tests/unit/seo/` pasan y verifican forma JSON y delegación de canonical
