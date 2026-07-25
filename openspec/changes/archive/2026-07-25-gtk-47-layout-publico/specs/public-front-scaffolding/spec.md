# public-front-scaffolding Specification

## MODIFIED Requirements

### Requirement: Layout del route group público

El layout `app/(public)/layout.tsx` SHALL envolver las páginas públicas con estructura semántica completa: skip-link, `header` con navegación sticky, `main` enfocable para el contenido de cada página, y `footer` con NAP leído de BD. Además SHALL montar GTM y el banner de consentimiento (GTK-46). La reconfiguración de cookies SHALL estar disponible desde el footer mediante `openConsentPreferences()`; no es obligatorio mantener un botón flotante fijo de cookies una vez desplegado el footer.

#### Scenario: Estructura semántica en cualquier página pública
- **WHEN** se solicita una página bajo `app/(public)/`
- **THEN** el HTML incluye `header`, `main` y `footer` producidos por el layout del grupo
