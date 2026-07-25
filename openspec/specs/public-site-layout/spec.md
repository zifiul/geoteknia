# public-site-layout Specification

## Purpose

Shell del sitio público B2B: cabecera sticky, navegación de silos, footer con NAP desde BD, skip-link, menú móvil accesible y patrón de breadcrumbs/JSON-LD. Materializado con GTK-47.

## Requirements

### Requirement: Layout público con header sticky y main enfocable

El grupo `app/(public)/` SHALL renderizar un header sticky accesible al scroll sin provocar CLS material, un elemento `main` con `id` estable para skip-link, y un footer con NAP. El skip-link "Saltar al contenido" SHALL ser el primer foco de tabulación y SHALL mover el foco a `main`.

#### Scenario: Skip-link enfoca main
- **WHEN** el usuario activa el skip-link desde el teclado
- **THEN** el foco se sitúa en el elemento `main` del layout público

### Requirement: Navegación de silos principales

La navegación principal SHALL exponer enlaces a Servicios, Zonas, Proyectos, Blog, Equipo, Maquinaria, Acreditaciones, Recursos y Contacto. El ítem correspondiente a la ruta actual SHALL declarar `aria-current="page"`.

#### Scenario: Item activo en ruta de silo
- **WHEN** el visitante está en una URL bajo un silo documentado
- **THEN** el enlace de ese silo en la navegación incluye `aria-current="page"`

### Requirement: Menú móvil accesible

Por debajo del breakpoint `lg`, la navegación SHALL abrirse en un panel con control hamburguesa (`aria-expanded`), cierre con Escape y foco atrapado (patrón Dialog/Radix). Por encima de `lg`, la navegación SHALL ser horizontal.

#### Scenario: Menú móvil por teclado
- **WHEN** el usuario abre el menú móvil y pulsa Escape
- **THEN** el panel se cierra y el foco vuelve al disparador

### Requirement: NAP desde organization_profile

El footer SHALL mostrar nombre, dirección y teléfono leídos mediante `getOrganizationProfile()` sin valores hardcodeados. La función SHALL ser de solo lectura pública, cacheada, y no SHALL exponer campos de auditoría internos.

#### Scenario: Footer con datos de BD
- **WHEN** existe un `organization_profile` activo en BD
- **THEN** el footer renderiza `displayName`, `napAddress` y `napPhone` de ese registro

### Requirement: CTAs móviles con StickyCtaBar existente

En viewports móviles, los CTAs de llamar, WhatsApp y presupuesto SHALL mostrarse en `StickyCtaBar` reutilizado (sin duplicar el componente). Los clics SHALL poder disparar eventos `click_tel`, `click_whatsapp` vía `trackConversionEvent` cuando haya consentimiento de analítica.

#### Scenario: Barra sticky en móvil
- **WHEN** el viewport es menor que `md`
- **THEN** la barra de CTAs permanece fija en la parte inferior de la pantalla

### Requirement: Reconfiguración de cookies en footer

El footer SHALL incluir un control "Configurar cookies" que invoque `openConsentPreferences()` exportado por el módulo de consentimiento (GTK-46), sin lógica duplicada del banner.

#### Scenario: Footer abre preferencias de cookies
- **WHEN** el usuario activa "Configurar cookies" en el footer
- **THEN** se muestra el diálogo de preferencias de cookies existente

### Requirement: Patrón breadcrumbs documentado

Las plantillas de silo SHALL usar `buildSiloBreadcrumbSegments()` para UI (`Breadcrumbs`) y `buildSiloBreadcrumbListSchema()` con `<JsonLd>` para JSON-LD, sin `<script>` manual.

#### Scenario: Un solo BreadcrumbList JSON-LD en página de prueba
- **WHEN** se renderiza la página de verificación de breadcrumbs del change
- **THEN** existe exactamente un `script[type="application/ld+json"]` cuyo `@type` es `BreadcrumbList` coherente con la UI visible

### Requirement: Ubicación Atomic Design

`SiteHeader`, `SiteNav` y `SiteFooter` SHALL residir en `components/organisms/layout/`. No SHALL crearse un directorio paralelo `components/layout/`.

#### Scenario: Rutas de componentes
- **WHEN** se importa la cabecera del sitio público
- **THEN** el módulo resuelve a `components/organisms/layout/SiteHeader`
