# public-contact-page

## Purpose

Página pública `/contacto` con NAP, canales segmentados, mapa diferido y SEO local.

## Requirements

### Requirement: Página de contacto pública

La ruta `/contacto` MUST mostrar NAP, canales por departamento, horario, mapa diferido y CTAs de conversión, con SEO y tracking coherentes con el resto del sitio público.

#### Scenario: Canales segmentados

- **WHEN** el usuario visita `/contacto`
- **THEN** se muestran enlaces de contacto para presupuestos, dirección técnica y licitaciones derivados de `getContactChannelByDepartment()`
- **AND** teléfono, email y WhatsApp usan `PhoneLink` / `ContactTrackLink` con eventos canónicos

#### Scenario: NAP consistente

- **WHEN** existe perfil de organización
- **THEN** el NAP visible coincide con los campos `napAddress`, `napPhone`, `napEmail` del mismo `getOrganizationProfile()` que alimenta el footer

#### Scenario: JSON-LD

- **WHEN** la página se renderiza con perfil válido
- **THEN** incluye `BreadcrumbList` y `ProfessionalService`/`LocalBusiness` con `url` apuntando a `/contacto`

#### Scenario: Mapa diferido

- **WHEN** hay dirección NAP
- **THEN** el mapa reserva espacio, muestra placeholder y carga iframe solo tras interacción de viewport (sin bloquear LCP)

#### Scenario: Contexto desde URL

- **WHEN** la URL incluye `servicio` y/o `provincia`
- **THEN** WhatsApp y tracking propagan `serviceSlug` y `provinceSlug`
