## ADDED Requirements

### Requirement: Portal shell autenticado

The system SHALL render an admin portal shell (sidebar 240px, topbar with role badge and logout) for authenticated routes under the `(portal)` route group, excluding `/admin/login` and bare `/admin/forbidden`.

#### Scenario: Sesión válida

- **WHEN** a user with a valid portal session visits `/admin`
- **THEN** the response includes the portal shell with navigation filtered by role permissions

### Requirement: Navegación por permisos

The system SHALL derive visible navigation items from `resolvePermissionCodesForRole(roleName)` without duplicating role-to-section maps in UI components.

#### Scenario: Técnico sin contenido

- **WHEN** a user with role `tecnico` views the sidebar
- **THEN** content and users sections are not present in the navigation

### Requirement: Acceso denegado auditado

The system SHALL redirect to `/admin/forbidden` when the user lacks permission for the requested path and SHALL record `access_denied` via `recordAudit` in best-effort mode.

#### Scenario: Ruta no permitida

- **WHEN** an `editor` navigates directly to `/admin/proyectos`
- **THEN** the user is redirected to `/admin/forbidden` and an audit log entry is attempted

### Requirement: Aislamiento SEO y GTM

The admin route group SHALL keep `robots: noindex, nofollow` and SHALL NOT load GTM marketing scripts on portal pages.

#### Scenario: Sin dataLayer en admin autenticado

- **WHEN** an authenticated user loads `/admin`
- **THEN** the page does not include `gtm.js` nor initialize `window.dataLayer`
