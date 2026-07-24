# portal-auth-totp — Delta spec (GTK-24)

## ADDED Requirements

### Requirement: Generación de secreto TOTP y URI otpauth

El sistema SHALL exponer en servidor `generateTotpSecret(label)` que genera un secreto Base32 y una URI `otpauth://` compatible con apps tipo Google Authenticator, usando `otplib`.

#### Scenario: URI válida para enrolamiento

- **WHEN** se invoca `generateTotpSecret` con el email del usuario como etiqueta
- **THEN** el resultado incluye `secret` y `otpauthUri` que comienza por `otpauth://totp/`

### Requirement: Verificación de código TOTP con ventana ±1 periodo

El sistema SHALL exponer `verifyTotpCode(secret, code)` que verifica códigos de 6 dígitos con tolerancia de ±1 periodo de 30 segundos (`epochTolerance` equivalente a 30 s).

#### Scenario: Código actual válido

- **WHEN** se verifica un código generado para el mismo secreto en el periodo actual
- **THEN** `verifyTotpCode` retorna `true`

#### Scenario: Código fuera de ventana

- **WHEN** se verifica un código de un periodo anterior fuera de la ventana configurada
- **THEN** `verifyTotpCode` retorna `false`

### Requirement: Cifrado del secreto TOTP en reposo

El sistema SHALL cifrar `users.twofa_secret` con AES-256-GCM usando `TWOFA_ENCRYPTION_KEY` antes de persistir, y SHALL descifrar solo en servidor para verificación. El secreto en claro NUNCA SHALL persistirse ni enviarse al cliente tras la activación.

#### Scenario: Round-trip cifrado

- **WHEN** se cifra un secreto y se descifra con la misma clave
- **THEN** el valor en claro coincide con el original

### Requirement: Verificador TOTP registrado para login

El sistema SHALL implementar `VerifyTotpFn` cargando `twofa_secret` del usuario, descifrándolo y validando el código cuando `twofa_enabled=true`, y SHALL registrar la implementación vía `registerVerifyTotp` al arrancar la configuración Auth.js (import for-side-effect desde `lib/auth/config.ts`).

#### Scenario: Login con 2FA activo y código correcto

- **WHEN** el usuario tiene `twofa_enabled=true`, secreto cifrado válido y el login incluye un código TOTP correcto
- **THEN** `verifyTotp(userId, code)` retorna `true` y el caso de uso de credenciales permite continuar

#### Scenario: Sin secreto o 2FA inactivo

- **WHEN** `verifyTotp` se invoca para un usuario sin `twofa_enabled` o sin `twofa_secret`
- **THEN** retorna `false`

### Requirement: Server Actions de gestión 2FA (self-service)

El sistema SHALL exponer Server Actions en `lib/auth/totp-actions.ts` protegidas por sesión portal válida (`getPortalSession`):

- `generateTotpSecretAction`: genera secreto, persiste cifrado con `twofa_enabled=false`, retorna `otpauthUri` y data-URL de QR solo durante enrolamiento.
- `confirmTotpActivationAction({ totp })`: valida código, pone `twofa_enabled=true` y audita `role_change` con `metadata.event = 2fa_enabled` en la misma transacción.
- `disableTotpAction({ password, totp })`: exige contraseña correcta y TOTP válido, borra secreto, pone `twofa_enabled=false` y audita `role_change` con `metadata.event = 2fa_disabled` en la misma transacción.

#### Scenario: Activación con código inválido

- **WHEN** `confirmTotpActivationAction` recibe un código incorrecto o caducado
- **THEN** no activa 2FA y retorna error sin exponer el secreto

#### Scenario: Desactivación sin reautenticación completa

- **WHEN** `disableTotpAction` recibe contraseña incorrecta o TOTP inválido
- **THEN** no modifica `twofa_enabled` ni el secreto

### Requirement: Página de seguridad del portal

El sistema SHALL ofrecer `app/(admin)/perfil/seguridad/` (noindex) que muestra el estado de 2FA y permite enrolamiento, confirmación y desactivación mediante un Client Component con formularios accesibles.

#### Scenario: Usuario sin sesión

- **WHEN** se accede a la página sin sesión portal válida
- **THEN** se redirige a `/admin/login`
