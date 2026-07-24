# dynamic-sitemap-robots Specification

## Purpose

Generación dinámica de sitemap XML, sitemap de imágenes y reglas `robots.txt` para descubrimiento SEO de contenido publicado e indexable. Materializa GTK-42; revalidación on-demand al publicar en GTK-40.

## Requirements

### Requirement: Sitemap principal solo contenido indexable

El sistema SHALL generar `app/sitemap.ts` incluyendo únicamente entidades con `workflow_status = 'publicado'`, `noindex = false` y `deleted_at IS NULL` (donde el modelo expone `noindex`). SHALL excluir rutas `/admin`, thank-you y filtros por construcción.

#### Scenario: Servicio publicado indexable

- **WHEN** existe un `Service` con `workflow_status='publicado'` y `noindex=false`
- **THEN** el sitemap incluye su URL (`canonical_url` si existe, si no patrón `/servicios/{slug}`) con `lastModified` desde `published_at` o `updated_at`

#### Scenario: Borrador excluido

- **WHEN** un `Service` está en `borrador_ia` o `noindex=true`
- **THEN** no aparece en el sitemap

### Requirement: Prioridad y frecuencia por tipo

El sistema SHALL asignar `priority` y `changeFrequency` según el tipo de entidad: servicios `1.0`/`monthly`; geo-zonas e intersección `0.8`/`monthly`; casos `0.7`/`monthly`; blog `0.6`/`weekly`; maestros (equipo, maquinaria, faq_group) `0.4`/`yearly`.

#### Scenario: Diferenciación verificable

- **WHEN** el sitemap agrega entradas de servicio y blog
- **THEN** la entrada de servicio tiene `priority` mayor que la de blog

### Requirement: Sitemap de imágenes con propietario publicado

El sistema SHALL servir `GET /sitemap-imagenes` con `Content-Type: application/xml`, namespace `image:`, incluyendo solo `media_assets` con `include_in_image_sitemap=true` cuya entidad propietaria vía `content_media` cumple el mismo criterio indexable que el sitemap principal.

#### Scenario: Imagen de borrador excluida

- **WHEN** un asset tiene `include_in_image_sitemap=true` pero el contenido propietario no está `publicado`
- **THEN** no aparece en el sitemap de imágenes

#### Scenario: Caption opcional

- **WHEN** `alt_text` y `title` son null
- **THEN** el XML omite `image:caption` sin fallar la generación

### Requirement: robots.txt extendido

El sistema SHALL extender `app/robots.ts` existente con `Disallow: /admin` y `Sitemap: {NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

#### Scenario: Referencia al sitemap

- **WHEN** se solicita `robots.txt`
- **THEN** contiene una línea `Sitemap:` con la URL base configurada

### Requirement: Punto de revalidación para GTK-40

El sistema SHALL exportar constante de tag/caché (`SITEMAP_CACHE_TAG = 'sitemap'`) y usar `revalidate = 3600` en sitemap hasta que GTK-40 invoque `revalidateTag`.

#### Scenario: Fallback ISR

- **WHEN** GTK-40 no ha revalidado
- **THEN** el sitemap se regenera como máximo cada 3600 segundos

### Requirement: Respuestas HTTP correctas

El sistema SHALL responder `200` a `GET /sitemap.xml`, `GET /sitemap-imagenes` y `GET /robots.txt` con el `Content-Type` adecuado (XML o texto robots).

#### Scenario: Sitemap principal XML

- **WHEN** un cliente solicita `GET /sitemap.xml`
- **THEN** la respuesta es `200` y el cuerpo es XML de sitemap válido
