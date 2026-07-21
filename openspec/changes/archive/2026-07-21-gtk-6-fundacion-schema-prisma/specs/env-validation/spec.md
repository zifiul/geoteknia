# env-validation — Delta Spec

## MODIFIED Requirements

### Requirement: Validación Zod de variables de entorno requeridas

El módulo `lib/env.ts` SHALL validar con un schema Zod todas las variables de entorno requeridas (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_ENV`) y SHALL exponer un objeto `env` tipado.

#### Scenario: Entorno completo parsea correctamente

- **WHEN** todas las variables requeridas están presentes y son válidas
- **THEN** `env` exporta valores tipados incluyendo `DATABASE_URL` y `DIRECT_URL`

#### Scenario: Falta de variable lanza error descriptivo sin valores

- **WHEN** falta al menos una variable requerida (p. ej. `DIRECT_URL`) y se importa `lib/env.ts`
- **THEN** se lanza un error que enumera solo los nombres de variables ausentes o inválidas, sin incluir valores de otras variables
