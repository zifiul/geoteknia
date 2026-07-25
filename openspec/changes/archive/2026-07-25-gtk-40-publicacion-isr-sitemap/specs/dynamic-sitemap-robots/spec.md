## MODIFIED Requirements

### Requirement: Punto de revalidación para GTK-40

El sistema SHALL exportar constante de tag/caché (`SITEMAP_CACHE_TAG = 'sitemap'`) y usar `revalidate = 3600` en sitemap como fallback. GTK-40 SHALL invocar `revalidateTag(SITEMAP_CACHE_TAG)` tras cada publicación o despublicación exitosa para que el sitemap refleje el cambio sin esperar al TTL.

#### Scenario: Revalidación on-demand

- **WHEN** GTK-40 publica contenido indexable
- **THEN** se invoca `revalidateTag` con `SITEMAP_CACHE_TAG` y la siguiente generación del sitemap incluye la URL

#### Scenario: Fallback ISR

- **WHEN** no ha habido publicación reciente
- **THEN** el sitemap se regenera como máximo cada 3600 segundos
