# Delta spec — project-scaffolding

> Origen: GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base

## ADDED Requirements

### Requirement: Proyecto Next.js 15 con TypeScript estricto compilable
El proyecto SHALL compilar con Next.js 15 (App Router), React 19 y TypeScript en modo estricto (`strict: true` y `noUncheckedIndexedAccess: true`) con alias de imports `@/*`, sin errores de tipo.

#### Scenario: Build de producción sin errores
- **WHEN** se ejecuta `npm run build` en un checkout limpio con dependencias instaladas
- **THEN** la compilación termina con código de salida 0 y sin errores de TypeScript

#### Scenario: Typecheck en verde
- **WHEN** se ejecuta `npm run typecheck`
- **THEN** `tsc --noEmit` termina con código de salida 0

### Requirement: Scripts de calidad operativos
El proyecto SHALL exponer los scripts `build`, `typecheck`, `lint`, `test` y `test:e2e` en `package.json`, y todos SHALL ejecutarse en verde (se permite suite vacía).

#### Scenario: Scripts presentes y en verde
- **WHEN** se ejecutan `npm run lint`, `npm run test` y `npm run test:e2e`
- **THEN** cada comando termina con código de salida 0

### Requirement: Estructura App Router con frontal público y grupo (admin)
La estructura `app/` SHALL contener el frontal público (home mínima que responde 200) y un grupo de rutas `(admin)` aislado, sin lógica de negocio.

#### Scenario: Home responde 200
- **WHEN** se arranca la aplicación y se solicita `GET /`
- **THEN** la respuesta tiene código HTTP 200

### Requirement: Carpetas de dominio en /lib con frontera limpia
Las carpetas `lib/leads/`, `lib/projects/`, `lib/content/`, `lib/ia/`, `lib/auth/` y `lib/email/` SHALL existir con index de barril, y ningún módulo de `/lib` SHALL importar desde `app/`. La frontera SHALL ser verificable mediante regla de lint (`no-restricted-imports`).

#### Scenario: Import de app/ desde /lib es rechazado por lint
- **WHEN** un fichero de `lib/**` añade un import de `app/**` y se ejecuta `npm run lint`
- **THEN** el lint falla señalando la importación prohibida

#### Scenario: Carpetas de dominio existentes
- **WHEN** se inspecciona el árbol de `lib/`
- **THEN** existen las seis carpetas de dominio con su `index.ts` de barril

### Requirement: Variables de entorno documentadas sin valores reales
El repositorio SHALL contener `.env.example` con todas las variables requeridas del proyecto (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_ENV`) documentadas y sin valores reales.

#### Scenario: .env.example completo y sin secretos
- **WHEN** se revisa `.env.example`
- **THEN** aparecen las ocho variables con comentario descriptivo y valores de ejemplo/placeholder, y ningún valor es un secreto real
