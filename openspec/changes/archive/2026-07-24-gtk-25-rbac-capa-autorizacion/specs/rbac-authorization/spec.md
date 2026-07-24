# rbac-authorization — Delta Spec

## ADDED Requirements

### Requirement: Comprobación de permiso atómico en memoria

El sistema SHALL exponer `can(user, permissionCode)` en `lib/auth/rbac.ts` que resuelve `true`/`false` a partir de `resolvePermissionCodesForRole(user.roleName)` de `lib/auth/permissions.ts`, sin consultar `role_permissions` en runtime.

#### Scenario: Permiso concedido por la matriz

- **WHEN** `can(user, 'projects.update')` se invoca con un `user.roleName` cuya matriz incluye ese permiso (`admin` o `gestor`)
- **THEN** devuelve `true`

#### Scenario: Permiso denegado por la matriz

- **WHEN** `can(user, 'projects.update')` se invoca con `user.roleName` = `editor` o `tecnico`
- **THEN** devuelve `false`

### Requirement: requirePermission valida sesión con espejo en BD y permiso

El sistema SHALL exponer `requirePermission(permissionCode)` en `lib/auth/rbac.ts` que obtiene la sesión vía `getPortalSession()` (espejo de sesión en BD, nunca solo el JWT), lanza `InvalidSessionError` si no hay sesión válida y `ForbiddenError` si la sesión es válida pero `can()` devuelve `false`.

#### Scenario: Sin sesión válida

- **WHEN** `requirePermission('projects.update')` se invoca sin sesión Auth.js activa
- **THEN** lanza `InvalidSessionError` sin comprobar el permiso

#### Scenario: Sesión revocada o expirada en BD

- **WHEN** `requirePermission(...)` se invoca con un JWT válido pero cuyo espejo en `sessions` tiene `revoked_at` no nulo o `expires_at` en el pasado
- **THEN** lanza `InvalidSessionError`, sin usar `getServerSession()` (solo-JWT) para esta comprobación

#### Scenario: Sesión válida sin permiso

- **WHEN** `requirePermission('projects.update')` se invoca con sesión válida de un usuario `editor`
- **THEN** lanza `ForbiddenError` antes de ejecutar cualquier handler de negocio

#### Scenario: Sesión válida con permiso

- **WHEN** `requirePermission('projects.update')` se invoca con sesión válida de un usuario `admin` o `gestor`
- **THEN** devuelve el `PortalSessionPayload` del usuario

### Requirement: getPortalSession cablea requireSession con dependencias reales

El sistema SHALL exponer `getPortalSession()` en `lib/auth/session.ts` como wrapper de cero argumentos que provee a `requireSession(deps)` un `getAuthSession` real (basado en `auth()` de `lib/auth/config.ts` y `hashSessionToken`) y un `findSessionMirror` real (consulta a `sessions` por `token_hash` vía `lib/db`).

#### Scenario: Wrapper delega en requireSession con deps reales

- **WHEN** se invoca `getPortalSession()`
- **THEN** internamente se ejecuta `requireSession({ getAuthSession, findSessionMirror })` con las implementaciones reales, no con dobles de test

### Requirement: Comprobación de pertenencia para el rol tecnico

El sistema SHALL exponer `assertOwnership(resource, user)` en `lib/auth/rbac.ts` que no hace nada para `admin`/`gestor` y, para `tecnico`, lanza `ForbiddenError` si `resource.assignedTechnicianId !== user.userId`.

#### Scenario: Técnico dueño del recurso

- **WHEN** `assertOwnership({ assignedTechnicianId: user.userId }, user)` se invoca con `user.roleName = 'tecnico'`
- **THEN** no lanza

#### Scenario: Técnico ajeno al recurso

- **WHEN** `assertOwnership({ assignedTechnicianId: 'otro-id' }, user)` se invoca con `user.roleName = 'tecnico'` y `user.userId !== 'otro-id'`
- **THEN** lanza `ForbiddenError`

#### Scenario: Admin o gestor sin restricción de pertenencia

- **WHEN** `assertOwnership({ assignedTechnicianId: 'cualquier-id' }, user)` se invoca con `user.roleName` = `admin` o `gestor`
- **THEN** no lanza, independientemente del valor de `assignedTechnicianId`

### Requirement: Wrappers withPermission y withRoutePermission no ejecutan el handler en denegación

El sistema SHALL exponer `withPermission(code, handler)` (para Server Actions) y `withRoutePermission(code, handler)` (para Route Handlers) en `lib/auth/rbac.ts`, que invocan `requirePermission(code)` antes de ejecutar `handler` y SHALL NOT ejecutar `handler` si la comprobación lanza.

#### Scenario: withPermission bloquea sin ejecutar el handler

- **WHEN** `withPermission('projects.update', handler)(...)` se invoca con una sesión sin el permiso
- **THEN** lanza el error de `requirePermission` y `handler` no se invoca

#### Scenario: withRoutePermission traduce la denegación a 401/403

- **WHEN** `withRoutePermission('projects.update', handler)(request)` se invoca sin sesión válida o sin permiso
- **THEN** devuelve una `Response` con status 401 (`InvalidSessionError`) o 403 (`ForbiddenError`) y cuerpo `{ success: false, error: { code, message } }`, sin invocar `handler`

#### Scenario: withRoutePermission delega al handler cuando concede

- **WHEN** `withRoutePermission('projects.update', handler)(request)` se invoca con sesión válida y permiso concedido
- **THEN** invoca `handler(user, request)` y devuelve su resultado

### Requirement: Denegación sin fuga de existencia de recurso

El sistema SHALL responder con el mismo `ForbiddenError` genérico (403) tanto si el recurso no existe como si existe pero no pertenece al usuario `tecnico`, y SHALL NOT ejecutar efectos secundarios (handler de negocio, `recordAudit`) en ninguna denegación de `requirePermission`, `assertOwnership`, `withPermission` o `withRoutePermission`.

#### Scenario: Mensaje de error no distingue el motivo

- **WHEN** `assertOwnership` deniega a un `tecnico` sobre un recurso ajeno
- **THEN** el mensaje/código de `ForbiddenError` es el mismo que para cualquier otra denegación de permiso, sin indicar si el recurso existe

#### Scenario: Sin efectos secundarios en denegación

- **WHEN** cualquier comprobación de esta capa deniega el acceso
- **THEN** no se ejecuta el handler de negocio envuelto ni se escribe una fila en `audit_logs` como consecuencia de esa denegación
