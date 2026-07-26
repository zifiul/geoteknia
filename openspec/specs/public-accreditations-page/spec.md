# public-accreditations-page Specification

## Purpose
TBD - created by archiving change gtk-59-acreditaciones. Update Purpose after archive.
## Requirements
### Requirement: Página pública de acreditaciones

El sistema SHALL exponer `/acreditaciones` como RSC que lista credenciales editoriales publicadas y no vencidas, agrupadas por `credential_type`, con logo, número de registro y enlace verificable.

#### Scenario: Credenciales publicadas

- **WHEN** existen filas en `accreditations` con `PUBLISHED_EDITORIAL_WHERE` y `valid_until` nulo o futuro
- **THEN** la página renderiza tarjetas por categoría con logo (`alt` = nombre), registro y enlace descriptivo a verificación

#### Scenario: Sin credenciales

- **WHEN** no hay credenciales publicadas vigentes
- **THEN** la página muestra estado vacío informativo

#### Scenario: Home sin regresión

- **WHEN** se llama `listActiveAccreditations()`
- **THEN** solo devuelve `{ id, name }` como antes de GTK-59

### Requirement: SEO y schema Organization

La página SHALL publicar metadata estática (`title`, `description`, `canonical` `/acreditaciones`, `robots: index,follow`), JSON-LD `BreadcrumbList` y `Organization` con `hasCredential` derivado de las mismas filas visibles.

#### Scenario: JSON-LD Organization

- **WHEN** hay credenciales visibles y perfil de organización
- **THEN** existe un script `application/ld+json` con `@type` `Organization` y `hasCredential` no vacío

### Requirement: Recorrido P3

La página SHALL incluir enlace visible a `/licitaciones` para obra pública / licitaciones.

#### Scenario: CTA licitaciones

- **WHEN** el usuario visita `/acreditaciones`
- **THEN** puede navegar a `/licitaciones` desde un CTA dedicado

### Requirement: Analítica de engagement

Los enlaces de verificación externa y el CTA a licitaciones SHALL disparar `select_content` en `dataLayer` tras consentimiento de analítica.

#### Scenario: Clic en verificación

- **WHEN** el usuario con consentimiento de analítica activa hace clic en un enlace de verificación
- **THEN** se empuja `select_content` con `content_type` `accreditation_verification`

