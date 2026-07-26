# Design — gtk-60-pagina-contacto

## Enfoque

- **Datos:** `getOrganizationProfile()` para NAP (misma fuente que footer). Tres lecturas `getContactChannelByDepartment` en paralelo. `listPublishedServices()` para `offerCatalog` en JSON-LD (patrón Home).
- **SEO:** `buildContactLocalBusinessJsonLd(profile, services)` con `url: {siteUrl}/contacto`. Breadcrumbs manuales `Inicio > Contacto`. Metadata en `lib/contact/page-config.ts`.
- **Contexto URL:** `searchParams` `servicio`/`provincia` propagados a WhatsApp y tracking (`parseContactContextSlugs('/contacto', params)`).
- **UI (Stitch):** hero «Sede central» con NAP; grid/lista de tres departamentos con tel/mail/WhatsApp; bloque horario estático (`CONTACT_OFFICE_HOURS`); mapa con placeholder y iframe lazy; barra de CTAs (presupuesto, ubicar parcela, WhatsApp presupuestos).
- **Mapa (decisión Opción A):** `https://maps.google.com/maps?q=${encodeURIComponent(napAddress)}&output=embed` sin nueva env var. Alternativa textual visible + `sr-only` con dirección completa.

## Threat model

### Superficie

- Página pública estática; iframe externo (Google Maps); enlaces `tel:`/`mailto:`/`wa.me`.

### Actores

- Usuario legítimo, bot de scraping, atacante intentando XSS vía query params en WhatsApp.

### Datos sensibles

- Teléfonos y emails de negocio (públicos). Sin PII de usuarios en la página.

### Amenazas

| # | Amenaza | Mitigación |
|---|---------|------------|
| T1 | XSS en mensaje WhatsApp vía params | `encodeURIComponent` en `buildWhatsAppUrl`; slugs solo alfanuméricos desde query |
| T2 | Open redirect en CTAs | Rutas fijas `/presupuesto`, `/ubicacion` + query construida por `buildContactContextQuery` |
| T3 | Clickjacking en iframe mapa | iframe de terceros con título accesible; sin datos sensibles |
| T4 | Fuga de datos internos en JSON-LD | Solo campos públicos del perfil |

### Criterios seguridad

- [ ] SEC-1: Query `servicio`/`provincia` no se reflejan como HTML sin escape (React text nodes).
- [ ] SEC-2: Mapa iframe solo si hay `napAddress` en perfil.

## Decisiones

- Horario: constante de producto hasta CMS (texto Stitch).
- Enlace ubicación: `/ubicacion` + contexto query (placeholder GTK-65).
- No usar `buildHomeLocalBusinessJsonLd()` (URL raíz incorrecta para esta página).

## Integración

- GTK-67: tracking `click_tel` / `click_whatsapp` / `click_email`.
- GTK-47: NAP footer mismo reader.
