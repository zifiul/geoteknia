# portal-auth-credentials Specification

## Purpose
TBD - created by archiving change gtk-23-autenticacion-credenciales-argon2. Update Purpose after archive.
## Requirements
### Requirement: Hash y verificación de contraseñas con argon2id

El sistema SHALL exponer `hashPassword(plain)` y `verifyPassword(hash, plain)` en `lib/auth/passwords.ts` usando argon2id. Nunca SHALL persistir ni registrar la contraseña en claro ni el hash completo en logs.

#### Scenario: Hash argon2id con sal distinta

- **WHEN** se hashea la misma contraseña dos veces con `hashPassword`
- **THEN** los hashes resultantes son distintos y ambos verifican con `verifyPassword`

#### Scenario: Verificación fallida

- **WHEN** `verifyPassword` recibe un hash válido y una contraseña incorrecta
- **THEN** retorna `false` sin lanzar

### Requirement: Login con credenciales vía Auth.js Credentials

El sistema SHALL autenticar usuarios internos mediante el proveedor Credentials de Auth.js v5: busca por email, verifica hash, exige `is_active = true` y, si `twofa_enabled = true`, exige un código TOTP válido verificado por `verifyTotp` registrado (GTK-24). Los fallos (usuario inexistente, inactivo, contraseña incorrecta, 2FA no disponible o inválido) SHALL producir el mismo mensaje genérico al cliente, sin revelar cuál campo falló.

#### Scenario: Credenciales válidas y usuario activo

- **WHEN** un usuario con `is_active = true`, `twofa_enabled = false` y contraseña correcta inicia sesión
- **THEN** Auth.js emite sesión, se actualiza `users.last_login_at` y se registra audit `login`

#### Scenario: Usuario inactivo o credenciales inválidas

- **WHEN** el email no existe, la contraseña es incorrecta o `is_active = false`
- **THEN** el login falla con error genérico, se registra `login_failed` y no se crea fila en `sessions`

#### Scenario: 2FA habilitado sin verificador disponible

- **WHEN** el usuario tiene `twofa_enabled = true` y no hay implementación registrada en `verifyTotp`
- **THEN** el login falla (sin bypass silencioso) y se registra `login_failed`

#### Scenario: 2FA habilitado con verificador y código válido

- **WHEN** el usuario tiene `twofa_enabled = true`, el verificador TOTP está registrado y el payload incluye un código TOTP válido
- **THEN** el login completa con éxito igual que un usuario sin 2FA

#### Scenario: 2FA habilitado con código ausente o inválido

- **WHEN** el usuario tiene `twofa_enabled = true`, el verificador está registrado y falta `totp` o el código es incorrecto
- **THEN** el login falla con error genérico al cliente y se registra `login_failed` con `attemptReason` acorde a TOTP inválido

### Requirement: Sesión JWT con espejo revocable en BD

El sistema SHALL usar estrategia de sesión JWT (`session.strategy = 'jwt'`) con TTL `SESSION_TTL_MINUTES` y SHALL persistir un espejo en `sessions` con `token_hash` (nunca el JWT en claro), `expires_at`, `ip_address` y `user_agent`. Los callbacks `jwt`/`session` SHALL invalidar la sesión si el espejo está revocado (`revoked_at` no nulo) o expirado.

#### Scenario: Mirror tras login correcto

- **WHEN** el login completa con éxito
- **THEN** existe una fila en `sessions` cuyo `token_hash` no es el JWT en claro y `expires_at` = now + `SESSION_TTL_MINUTES`

#### Scenario: Sesión revocada o expirada

- **WHEN** el JWT es válido pero el espejo en BD tiene `revoked_at` no nulo o `expires_at` en el pasado
- **THEN** la sesión se considera inválida y `requireSession` / callbacks no exponen usuario

### Requirement: Helpers getServerSession y requireSession

El sistema SHALL exponer `getServerSession()` y `requireSession()` en `lib/auth/session.ts`. `requireSession` SHALL redirigir o lanzar cuando no hay sesión válida; cuando sí, SHALL devolver payload tipado con `userId`, `roleId` y `roleName`.

#### Scenario: Sesión válida

- **WHEN** hay JWT válido y espejo activo en BD
- **THEN** `requireSession` retorna `{ userId, roleId, roleName }`

#### Scenario: Sin sesión

- **WHEN** no hay cookie/sesión Auth.js válida
- **THEN** `requireSession` redirige a `/admin/login` (o lanza según configuración del helper)

### Requirement: Server Action loginAction

El sistema SHALL exponer `loginAction` en `lib/auth/login-action.ts` que valida `{ email, password, totp? }` con Zod, delega en `signIn('credentials', …)` y traduce errores de Auth.js a mensajes genéricos. La action SHALL ser delgada (sin reglas de negocio propias).

#### Scenario: Payload inválido

- **WHEN** `loginAction` recibe email no válido o password con menos de 8 caracteres
- **THEN** retorna error de validación sin invocar Auth.js

#### Scenario: Login OK vía action

- **WHEN** `loginAction` recibe credenciales válidas de un usuario activo sin 2FA
- **THEN** completa el sign-in y el caller puede redirigir al portal

### Requirement: Handler Auth.js bajo /api/auth

El sistema SHALL exponer los handlers Auth.js en `app/api/auth/[...nextauth]/route.ts` (`GET`/`POST`) exportando `handlers` de la configuración.

#### Scenario: CSRF disponible

- **WHEN** un cliente hace `GET /api/auth/csrf`
- **THEN** recibe 200 con token CSRF

### Requirement: Auditoría de login sin secretos

El sistema SHALL registrar `login` (éxito) y `login_failed` (fallo) vía `recordAudit` de GTK-22, con `ip_address` y `user_agent`, metadata solo con claves de la whitelist (`method`/`roleName` o `method`/`attemptReason`). Nunca SHALL incluir password, hash, totp ni token en metadata o logs.

#### Scenario: Login fallido audita attemptReason

- **WHEN** falla el login por credenciales o usuario inactivo
- **THEN** existe una fila `audit_logs` con `action = login_failed` y metadata sanitizada sin secretos

