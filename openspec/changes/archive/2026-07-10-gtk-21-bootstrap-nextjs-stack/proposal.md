# Proposal — gtk-21-bootstrap-nextjs-stack

> US: [GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base](https://linear.app/geoteknia/issue/GTK-21/chore-01-bootstrap-del-proyecto-nextjs-15-y-stack-base)
> Dependencias de la US: ninguna (bloquea a GTK-43, GTK-36, GTK-23 y GTK-27)

## Why

El repositorio de Geoteknia es greenfield: solo contiene documentación y no existe `package.json`, `app/` ni `prisma/`. Ningún ticket funcional (auth, leads, CMS, IA, email) puede implementarse sin el andamiaje del monolito modular Next.js 15 y sin las fronteras de dominio en `/lib`. Esta US-0 de bootstrap materializa la decisión de arquitectura "Monolito modular sobre Next.js, un despliegue, un lenguaje" (documento de arquitectura §2) y habilita RNF-PERF (SSG/ISR) y RNF-ADMIN.

## What Changes

- Se inicializa el proyecto Next.js 15 (App Router) + React 19 + TypeScript estricto (`strict: true`, `noUncheckedIndexedAccess: true`) con alias `@/*`.
- Se crea la estructura `app/` con frontal público y grupo de rutas `(admin)` aislado.
- Se instala el stack base: Prisma + `@prisma/client`, Zod, Auth.js v5 (`next-auth@5`), `@anthropic-ai/sdk`, Resend + `@react-email/components`, `argon2`, `otplib`; y en dev: Vitest, `@playwright/test`, ESLint, Prettier.
- Se crea `lib/env.ts`: validación de variables de entorno con Zod, server-only, con error explícito al arrancar si falta alguna variable.
- Se crea `lib/db.ts`: singleton de `PrismaClient` sobre `globalThis` (patrón anti multi-conexión en serverless/Neon y hot-reload en dev).
- Se crean las carpetas de dominio vacías con index de barril: `lib/leads/`, `lib/projects/`, `lib/content/`, `lib/ia/`, `lib/auth/`, `lib/email/`.
- Se configuran `vitest.config.ts`, `playwright.config.ts` y los scripts `build`, `typecheck`, `lint`, `test`, `test:e2e`.
- Se añade regla ESLint `no-restricted-imports` que impide que `/lib` importe de `app/` (frontera modular para futura extracción).
- Se crea `.env.example` con todas las variables documentadas y sin valores reales.
- Sin lógica de negocio ni endpoints: solo andamiaje.

## Capabilities

### New Capabilities

- `project-scaffolding`: estructura base del monolito modular (App Router público + `(admin)`, carpetas de dominio en `/lib` con frontera limpia, tooling de build/lint/test operativo).
- `env-validation`: validación tipada y server-only de variables de entorno con Zod en `lib/env.ts`, con fallo explícito y descriptivo en arranque.
- `db-client`: singleton de `PrismaClient` en `lib/db.ts` reutilizado entre hot-reloads y seguro para serverless.

### Modified Capabilities

Ninguna (no existen specs vivas todavía; el repositorio no tiene código de aplicación).

## Impact

- **Código:** se crea todo el andamiaje (`app/`, `lib/`, configs raíz). No se modifica código existente porque no hay.
- **Dependencias:** se introduce el árbol de dependencias completo del stack base (ver "What Changes").
- **API:** no se exponen endpoints; la fase de contrato del harness se omite.
- **SEO/ISR:** habilita el cumplimiento futuro de RNF-PERF; la home creada es mínima (smoke test 200).
- **RGPD/PII:** sin PII. `.env.example` no contiene valores reales; `lib/env.ts` es server-only y no expone secretos al cliente.
- **Seguridad /admin:** solo se crea el grupo de rutas `(admin)` vacío; la autenticación llega con GTK-23.
- **Tickets desbloqueados:** GTK-43 (frontal), GTK-36 (Claude server-side), GTK-23 (Auth.js v5), GTK-27 (email transaccional).

## Fuera de alcance

- Lógica de negocio de cualquier dominio (leads, projects, content, IA, auth, email).
- Schema de Prisma con modelos reales y migraciones (solo el cliente y el singleton; el modelo de datos llega con su ticket).
- Autenticación, RBAC, 2FA y audit log (GTK-23).
- Integración real con Anthropic, Resend o Turnstile (solo instalación de SDKs y variables de entorno documentadas).
- UI del frontal público más allá de una home mínima para el smoke test.
- CI/CD, Lighthouse CI y despliegue en Vercel.
