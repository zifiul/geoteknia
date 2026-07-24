# env-validation Specification

## Purpose

Validación tipada y server-only de variables de entorno requeridas por el monolito Geoteknia (`lib/env.ts`).
## Requirements
### Requirement: Validación Zod de variables de entorno en lib/env.ts

El módulo `lib/env.ts` SHALL validar con un schema Zod todas las variables de entorno requeridas (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_ENV`) y SHALL exponer un objeto `env` tipado.

#### Scenario: Entorno completo parsea correctamente

- **WHEN** todas las variables requeridas están definidas y se importa `lib/env.ts`
- **THEN** el módulo exporta el objeto `env` tipado con los valores parseados, incluyendo `DATABASE_URL` y `DIRECT_URL`

#### Scenario: Falta una variable obligatoria

- **WHEN** falta al menos una variable requerida (p. ej. `DATABASE_URL` o `DIRECT_URL`) y se importa `lib/env.ts`
- **THEN** el módulo lanza un error explícito cuyo mensaje identifica la(s) variable(s) ausente(s), sin incluir valores de otras variables

### Requirement: lib/env.ts es server-only

El módulo `lib/env.ts` SHALL marcarse con `import 'server-only'` de modo que su inclusión en un Client Component provoque error de build, evitando la exposición de secretos al cliente.

#### Scenario: Import desde Client Component falla

- **WHEN** un Client Component (`'use client'`) importa `lib/env.ts` y se compila el proyecto
- **THEN** la compilación falla por la restricción `server-only`

### Requirement: SESSION_TTL_MINUTES en el schema de entorno

El módulo `lib/env.ts` SHALL validar `SESSION_TTL_MINUTES` como entero positivo (`z.coerce.number().int().positive()`) y exponerlo en el objeto `env` tipado junto al resto de variables ya requeridas (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.).

#### Scenario: TTL presente y positivo

- **WHEN** `SESSION_TTL_MINUTES` está definido como entero positivo y se importa `lib/env.ts`
- **THEN** `env.SESSION_TTL_MINUTES` es ese número tipado

#### Scenario: TTL ausente o no positivo

- **WHEN** falta `SESSION_TTL_MINUTES` o su valor no es un entero positivo
- **THEN** el módulo lanza un error que identifica `SESSION_TTL_MINUTES` por nombre, sin filtrar valores de secretos

### Requirement: Clave de cifrado TOTP

El sistema SHALL validar `TWOFA_ENCRYPTION_KEY` en `lib/env.ts` como cadena hexadecimal de exactamente 64 caracteres (32 bytes) para cifrado AES-256-GCM de `twofa_secret`.

#### Scenario: Clave válida

- **WHEN** `TWOFA_ENCRYPTION_KEY` tiene 64 caracteres hexadecimales
- **THEN** el módulo `env` exporta el valor tipado sin error

#### Scenario: Clave ausente o mal formada

- **WHEN** falta la variable o no cumple longitud/formato
- **THEN** el arranque falla con mensaje que enumera el nombre de la variable sin volcar valores

