# env-validation Specification (delta)

> Delta spec — US: [GTK-23](https://linear.app/geoteknia/issue/GTK-23/autenticacion-del-portal-con-authjs-v5-credenciales-argon2)
> Modifica la validación de entorno para el TTL de sesión del portal.

## ADDED Requirements

### Requirement: SESSION_TTL_MINUTES en el schema de entorno

El módulo `lib/env.ts` SHALL validar `SESSION_TTL_MINUTES` como entero positivo (`z.coerce.number().int().positive()`) y exponerlo en el objeto `env` tipado junto al resto de variables ya requeridas (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.).

#### Scenario: TTL presente y positivo

- **WHEN** `SESSION_TTL_MINUTES` está definido como entero positivo y se importa `lib/env.ts`
- **THEN** `env.SESSION_TTL_MINUTES` es ese número tipado

#### Scenario: TTL ausente o no positivo

- **WHEN** falta `SESSION_TTL_MINUTES` o su valor no es un entero positivo
- **THEN** el módulo lanza un error que identifica `SESSION_TTL_MINUTES` por nombre, sin filtrar valores de secretos
