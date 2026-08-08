# env-validation — delta docker-local-ci-environment

## MODIFIED Requirements

### Requirement: Validación Zod de variables de entorno en lib/env.ts

El módulo `lib/env.ts` SHALL validar con un schema Zod todas las variables de entorno requeridas (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_ENV`) y SHALL exponer un objeto `env` tipado. `DATABASE_URL` y `DIRECT_URL` SHALL aceptar cadenas con esquema `postgresql://` o `postgres://`, incluyendo conexiones Neon con `sslmode=require` y conexiones Docker local con `sslmode=disable`.

#### Scenario: Entorno completo parsea correctamente

- **WHEN** todas las variables requeridas están definidas y se importa `lib/env.ts`
- **THEN** el módulo exporta el objeto `env` tipado con los valores parseados, incluyendo `DATABASE_URL` y `DIRECT_URL`

#### Scenario: Falta una variable obligatoria

- **WHEN** falta al menos una variable requerida (p. ej. `DATABASE_URL` o `DIRECT_URL`) y se importa `lib/env.ts`
- **THEN** el módulo lanza un error explícito cuyo mensaje identifica la(s) variable(s) ausente(s), sin incluir valores de otras variables

#### Scenario: URL de base de datos Docker válida

- **WHEN** `DATABASE_URL` es `postgresql://geoteknia:geoteknia_dev_only@localhost:5433/geoteknia_dev?sslmode=disable` y `DIRECT_URL` tiene el mismo formato
- **THEN** el módulo exporta `env` sin error

#### Scenario: URL de base de datos Neon válida

- **WHEN** `DATABASE_URL` es `postgresql://user:pass@host.eu-central-1.aws.neon.tech/geoteknia?sslmode=require` y `DIRECT_URL` apunta al mismo host
- **THEN** el módulo exporta `env` sin error

#### Scenario: URL de base de datos con esquema inválido

- **WHEN** `DATABASE_URL` no comienza por `postgresql://` ni `postgres://`
- **THEN** el arranque falla identificando `DATABASE_URL` sin volcar el valor
