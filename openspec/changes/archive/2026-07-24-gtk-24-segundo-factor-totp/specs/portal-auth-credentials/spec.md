# portal-auth-credentials — Delta spec (GTK-24)

## MODIFIED Requirements

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
