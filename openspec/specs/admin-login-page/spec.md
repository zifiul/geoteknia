# admin-login-page Specification

## Purpose
TBD - created by archiving change gtk-69-admin-login-portal. Update Purpose after archive.
## Requirements
### Requirement: Página /admin/login noindex

El sistema SHALL exponer `/admin/login` como página de autenticación del portal con `robots: noindex,nofollow` y layout auth sin sidebar (Stitch split-panel).

#### Scenario: Metadata y acceso anónimo

- **WHEN** un usuario sin sesión solicita `/admin/login`
- **THEN** la respuesta es 200 con formulario de login y meta robots noindex
- **AND** el middleware no redirige en bucle sobre la propia ruta de login

### Requirement: Formulario credenciales + TOTP opcional (Opción A)

El formulario SHALL enviar email, contraseña y TOTP opcional en un solo paso a `loginAction`, validando con `loginInputSchema` en cliente y servidor.

#### Scenario: Login sin 2FA

- **WHEN** las credenciales son válidas y el usuario no tiene 2FA
- **THEN** se crea sesión y el cliente redirige a `callbackUrl` o `/admin`

#### Scenario: Mensaje genérico de fallo

- **WHEN** las credenciales fallan o el TOTP es incorrecto o ausente para cuenta 2FA
- **THEN** se muestra `LOGIN_INVALID_CREDENTIALS_MESSAGE` sin distinguir la causa

### Requirement: Rate limit de login

`loginAction` SHALL devolver `code: RATE_LIMITED` cuando se excede `RATE_LIMIT_LOGIN_PER_MIN` por IP.

#### Scenario: Demasiados intentos

- **WHEN** se supera el umbral en la ventana de 60 s
- **THEN** la acción responde `{ ok: false, error: { code: 'RATE_LIMITED', ... } }` y la UI muestra alerta accesible

### Requirement: Callback URL segura

Tras login exitoso, la redirección SHALL usar solo paths internos derivados de `callbackUrl` query o `/admin` por defecto.

#### Scenario: Rechazo de URL externa

- **WHEN** `callbackUrl` apunta a host externo o protocol-relative
- **THEN** se usa `/admin` como destino

