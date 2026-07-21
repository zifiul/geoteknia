# Delta spec — env-validation

> Origen: GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base

## ADDED Requirements

### Requirement: Validación Zod de variables de entorno en lib/env.ts
El módulo `lib/env.ts` SHALL validar con un schema Zod todas las variables de entorno requeridas (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_ENV`) y SHALL exponer un objeto `env` tipado.

#### Scenario: Entorno completo parsea correctamente
- **WHEN** todas las variables requeridas están definidas y se importa `lib/env.ts`
- **THEN** el módulo exporta el objeto `env` tipado con los valores parseados

#### Scenario: Falta una variable obligatoria
- **WHEN** falta al menos una variable requerida (p. ej. `DATABASE_URL`) y se importa `lib/env.ts`
- **THEN** el módulo lanza un error explícito cuyo mensaje identifica la(s) variable(s) ausente(s)

### Requirement: lib/env.ts es server-only
El módulo `lib/env.ts` SHALL marcarse con `import 'server-only'` de modo que su inclusión en un Client Component provoque error de build, evitando la exposición de secretos al cliente.

#### Scenario: Import desde Client Component falla
- **WHEN** un Client Component (`'use client'`) importa `lib/env.ts` y se compila el proyecto
- **THEN** la compilación falla por la restricción `server-only`
