# Design — gtk-25-rbac-capa-autorizacion

> Primitiva de autorización en `lib/auth/rbac.ts`, apoyada en la sesión de GTK-23 y la matriz de permisos de GTK-7/GTK-17.

## Enfoque técnico

1. **Tipo de usuario:** reutilizar `PortalSessionPayload` (`{ userId, roleId, roleName }`) de `lib/auth/session.ts` como el "user" de toda la primitiva. No se introduce un tipo `SessionUser` nuevo.
2. **`can(user, permissionCode)`:** función pura, sin BD — `resolvePermissionCodesForRole(user.roleName).includes(permissionCode)`. O(1) en memoria, sin caché que invalidar. La tabla `role_permissions` es una materialización de la matriz de código (vía `seedRbac`), no la fuente de verdad en runtime.
3. **Sesión verificable en BD — `getPortalSession()`:** `getServerSession()` (GTK-23) solo lee el JWT vía `auth()` y no comprueba `revokedAt`/`expiresAt` contra `sessions`; usarlo en autorización dejaría pasar una sesión revocada cuyo JWT aún no ha caducado. `requireSession(deps)` sí comprueba el espejo pero exige inyectar dependencias. Se añade `getPortalSession()` en `lib/auth/session.ts` como wrapper cableado de cero argumentos: `getAuthSession` lee `auth()` + hashea el token de sesión (`hashSessionToken`), `findSessionMirror` consulta `sessions` por `token_hash` vía `lib/db`. `requirePermission()` usa siempre `getPortalSession()`, nunca `getServerSession()`.
4. **`requirePermission(permissionCode)`:** llama a `getPortalSession()` → si no hay sesión válida (ausente, revocada o expirada) lanza `InvalidSessionError` (401, reutilizada de `session.ts`); si hay sesión pero `can()` es `false`, lanza `ForbiddenError` (403, nueva en `rbac-errors.ts`); si pasa, devuelve el `PortalSessionPayload`.
5. **`assertOwnership(resource, user)`:** no-op para `admin`/`gestor`; para `tecnico` exige `resource.assignedTechnicianId === user.userId`; si no, `ForbiddenError`. Mismo error genérico tanto si el recurso no existe (lo decide el caller antes de invocar) como si existe pero no es del técnico — anti-enumeración.
6. **Wrappers:** `withPermission(code, handler)` para Server Actions y `withRoutePermission(code, handler)` para Route Handlers. Ambos invocan `requirePermission(code)` primero; solo si concede, ejecutan `handler(user, ...)`. `withRoutePermission` traduce `InvalidSessionError`/`ForbiddenError` a `Response` 401/403 con cuerpo `{ success: false, error: { code, message } }` (no existe helper `okJson`/`problemJson` compartido en el repo; se adopta si otro ticket lo introduce).
7. **Errores:** seguir el patrón `XxxError extends Error` ya usado (`InvalidSessionError`, `AuditValidationError`, `LeadConfirmationValidationError`). Solo se crea `ForbiddenError`; no se introduce un `AppError` genérico no usado en ningún otro módulo real.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| `can()` resuelve en memoria contra `resolvePermissionCodesForRole` | Consultar `role_permissions` en cada comprobación | O(1), sin caché que invalidar; la tabla es solo materialización vía seed |
| `requirePermission()` usa `getPortalSession()` (espejo BD) | Usar `getServerSession()` (solo JWT) | Evita bypass de revocación: una sesión revocada con JWT aún vigente no debe autorizar |
| `getPortalSession()` vive en `lib/auth/session.ts` | Cablear las deps de `requireSession` dentro de `rbac.ts` | Mantiene `session.ts` como dueño de la resolución de sesión; `rbac.ts` solo consume `PortalSessionPayload` |
| Un único `ForbiddenError` genérico para permiso y pertenencia | Errores distintos por tipo de denegación | Anti-enumeración: el caller de `rbac.ts` no debe poder distinguir "sin permiso" de "no es tu recurso" por el tipo de excepción |
| `withRoutePermission` devuelve cuerpo mínimo propio | Esperar/crear un helper `okJson`/`problemJson` compartido | No existe hoy en el repo (verificado); evita inventar un contrato de respuesta no usado en ningún handler real |
| `session()` callback de `lib/auth/config.ts` expone `sessionTokenHash` en `session.user` (adición mínima, descubierta en TDD-RED) | Leer el JWT crudo con `getToken()` de `next-auth/jwt` dentro de `getPortalSession()` | `authConfig.session()` ya construye `session.user` a mano con los claims del token (`roleId`, `roleName`); añadir `sessionTokenHash` sigue el mismo patrón en vez de introducir una segunda vía de lectura del JWT. Sin este campo, `getPortalSession()` no puede obtener el `tokenHash` para consultar el espejo en `sessions` |

> **Nota de alcance:** el hallazgo anterior añade `lib/auth/config.ts` a los ficheros tocados por esta US (solo el `session()` callback, un campo adicional). No cambia el contrato de sesión existente (`requireSession`, `getServerSession`) ni introduce API/UI nueva — se mantiene dentro del alcance aprobado en Gate 1.

## Threat model

### Superficie de ataque

- Ninguna ruta HTTP ni Server Action propia expuesta por esta US: es una librería interna (`lib/auth/rbac.ts`) invocada por Server Actions/Route Handlers de tickets futuros.
- Superficie indirecta: cualquier módulo que en el futuro omita envolver su handler con `withPermission`/`withRoutePermission`/`requirePermission` queda sin protección — la primitiva debe ser difícil de usar mal (API simple, un solo punto de entrada por tipo de handler).

### Actores

- Usuario autenticado con rol `tecnico` intentando acceder a un proyecto no asignado.
- Usuario autenticado con rol `editor` intentando invocar una acción de `gestor`/`admin` (escalada horizontal).
- Atacante con sesión revocada (logout, cambio de contraseña, expulsión) cuyo JWT aún no ha expirado, intentando reutilizarlo.
- Atacante sin sesión válida invocando directamente un Server Action o Route Handler protegido (bypass de UI).

### Datos sensibles implicados

- Ninguna PII directa. El dato sensible es el propio control de acceso: `assignedTechnicianId` (vínculo usuario↔proyecto) y el estado de revocación de sesión.
- Clasificación RGPD: N/A (no persiste ni transita PII en esta capa).

### Amenazas identificadas

| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Escalada de rol horizontal | `editor` invoca un handler protegido con permiso `projects.update` | Alto — acceso no autorizado a módulo ajeno | `can()` resuelve contra la matriz de 4 roles × 17 permisos; `requirePermission` bloquea con 403 antes de ejecutar el handler |
| T2 | Acceso a recurso ajeno por `tecnico` (IDOR) | `tecnico` accede a proyecto con `assignedTechnicianId` distinto de su `userId` | Alto — acceso a datos de otro técnico | `assertOwnership()` obligatorio para `tecnico`; mismo `ForbiddenError` exista o no el recurso (anti-enumeración) |
| T3 | Reutilización de sesión revocada | JWT válido pero fila `sessions.revoked_at` no nulo | Alto — acceso tras logout/expulsión/cambio de rol | `requirePermission` usa `getPortalSession()` → `requireSession(deps)`, que consulta el espejo en BD; nunca `getServerSession()` (solo-JWT) |
| T4 | Bypass de autorización invocando el handler sin pasar por el wrapper | Import directo del caso de uso en vez de `withPermission`/`withRoutePermission` | Medio — depende de disciplina de los tickets consumidores, fuera del control de esta US | Mitigación parcial: API mínima y documentada (`rbac.ts` como único punto de entrada); enforcement completo es responsabilidad de code-review de cada módulo consumidor (fuera de alcance de GTK-25) |
| T5 | Fuga de existencia de recurso vía código de error | Respuestas distintas para "no tiene permiso" vs "recurso no existe" | Bajo-medio — enumeración de recursos | Un único `ForbiddenError`/403 para ambos casos; el caller decide antes si el recurso existe, pero `assertOwnership` no distingue el motivo en el mensaje |
| T6 | Efectos secundarios en denegación | El handler de negocio o `recordAudit` se ejecutan antes de comprobar el permiso | Medio — auditoría o mutación indebida | `withPermission`/`withRoutePermission` comprueban el permiso **antes** de invocar `handler`; test explícito de que el handler no se llama en denegación |

Amenazas descartadas explícitamente:
- Inyección SQL/XSS: no aplica, esta US no acepta input de usuario (solo `permissionCode` interno y objetos ya tipados).
- Rate limit / Turnstile: no aplica, no hay endpoint público.
- Prompt injection / IA: no aplica, esta US no invoca IA.

### Requisitos de seguridad (criterios de aceptación verificables)

- [ ] SEC-1: `requirePermission('projects.update')` deja pasar a `admin`/`gestor` y lanza `ForbiddenError` para `editor`/`tecnico`, antes de tocar la base de datos o ejecutar el handler.
- [ ] SEC-2: `assertOwnership()` con `tecnico` y `resource.assignedTechnicianId !== user.userId` lanza `ForbiddenError`; con `assignedTechnicianId === user.userId` no lanza; con `admin`/`gestor` nunca lanza.
- [ ] SEC-3: `requirePermission()` con sesión cuyo espejo en BD tiene `revokedAt` no nulo o `expiresAt` en el pasado lanza `InvalidSessionError`, aunque el JWT sea válido (verifica uso de `getPortalSession()`, no `getServerSession()`).
- [ ] SEC-4: `withPermission`/`withRoutePermission` no invocan el `handler` de negocio cuando `requirePermission` lanza (ni `ForbiddenError` ni `InvalidSessionError`).
- [ ] SEC-5: el cuerpo de error de `withRoutePermission` en 401/403 no incluye información sobre si el recurso existe (mensaje genérico).

## Verificación

- `npm run test`, `npm run typecheck`, `npm run lint`.
- Tests: matriz `can()` completa (4 roles × 17 permisos vía `resolvePermissionCodesForRole` como oráculo), `assertOwnership` (dueño/ajeno/admin/gestor), `requirePermission` (401/403/pasa, mock de deps de `requireSession`), `withPermission`/`withRoutePermission` (no ejecutan handler en denegación).
