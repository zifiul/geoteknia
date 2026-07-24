# env-validation — Delta spec (GTK-24)

## ADDED Requirements

### Requirement: Clave de cifrado TOTP

El sistema SHALL validar `TWOFA_ENCRYPTION_KEY` en `lib/env.ts` como cadena hexadecimal de exactamente 64 caracteres (32 bytes) para cifrado AES-256-GCM de `twofa_secret`.

#### Scenario: Clave válida

- **WHEN** `TWOFA_ENCRYPTION_KEY` tiene 64 caracteres hexadecimales
- **THEN** el módulo `env` exporta el valor tipado sin error

#### Scenario: Clave ausente o mal formada

- **WHEN** falta la variable o no cumple longitud/formato
- **THEN** el arranque falla con mensaje que enumera el nombre de la variable sin volcar valores
