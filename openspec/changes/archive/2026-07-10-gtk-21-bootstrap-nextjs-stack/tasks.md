# Tasks — gtk-21-bootstrap-nextjs-stack

> US: GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base
> Sin endpoints HTTP (fase de contrato omitida) y sin BD real (Prisma sin modelos): los pasos N+2 (curl) se limitan al smoke de la home y la verificación de BD se documenta como no aplicable.

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml`, `docs/technical/base-standards.md`, `backend-standards.md` y `frontend-standards.md` (secciones aplicables al andamiaje).
- [x] 0.2 Crear/verificar la rama `feature/chore-gtk-21-bootstrap-nextjs-stack`.
- [x] 0.3 Verificar rama actual y `git status` para detectar trabajo previo del usuario.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado.

## 1. TDD-RED: tests primero (gate duro — sin RED no hay implementación)

- [x] 1.1 Crear `tests/unit/env.test.ts`: entorno completo parsea y exporta `env` tipado; falta de variable lanza error con el nombre de la variable (SEC-4: el mensaje no contiene valores de otras variables).
- [x] 1.2 Crear `tests/unit/db.test.ts`: misma instancia de `PrismaClient` entre imports (reset de módulos) en dev; en `NODE_ENV=production` no se registra en `globalThis`.
- [x] 1.3 Crear `tests/e2e/home.spec.ts`: smoke `GET /` responde 200.
- [x] 1.4 Ejecutar el runner y adjuntar salida verificando que las suites están en ROJO (fallan porque `lib/env.ts` y `lib/db.ts` no existen). Guardar evidencia en `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/YYYY-MM-DD-step-1-tdd-red.md`.

## 2. Andamiaje del proyecto

- [x] 2.1 Crear `package.json` con scripts `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:e2e` e instalar dependencias: `next@15`, `react@19`, `react-dom@19`, `prisma`, `@prisma/client`, `zod`, `next-auth@5`, `@anthropic-ai/sdk`, `resend`, `@react-email/components`, `argon2`, `otplib`, `server-only`; dev: `typescript`, `vitest`, `@playwright/test`, `eslint`, `prettier`, tipos.
- [x] 2.2 Crear `tsconfig.json` estricto (`strict`, `noUncheckedIndexedAccess`) con alias `@/*` y `next.config.ts`.
- [x] 2.3 Crear `app/layout.tsx` y `app/page.tsx` (home mínima) y `app/(admin)/admin/page.tsx` placeholder con metadata `noindex` (SEC-5).
- [x] 2.4 Crear `prisma/schema.prisma` mínimo (datasource PostgreSQL + generator) y ejecutar `npx prisma generate`.
- [x] 2.5 Crear `.env.example` con las 8 variables documentadas sin valores reales (SEC-2) y `.gitignore` que excluya `.env*` locales.
- [x] 2.6 Configurar ESLint flat config con `no-restricted-imports` en `lib/**` prohibiendo imports de `app/` y `@/app/*`.
- [x] 2.7 Crear `vitest.config.ts` (environment node, alias `@/*`) y `playwright.config.ts` (webServer + chromium).

## 3. Módulos base de /lib

- [x] 3.1 Implementar `lib/env.ts`: `import 'server-only'`, schema Zod de las 8 variables, fail-fast con mensaje que enumera solo nombres de variables ausentes (SEC-1, SEC-4).
- [x] 3.2 Implementar `lib/db.ts`: singleton `PrismaClient` sobre `globalThis` solo fuera de producción.
- [x] 3.3 Crear carpetas de dominio `lib/leads/`, `lib/projects/`, `lib/content/`, `lib/ia/`, `lib/auth/`, `lib/email/` con `index.ts` de barril.

## 4. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 4.1 Localizar tests existentes en el repo (no debería haber: greenfield) y confirmar que las suites de la fase 1 siguen siendo las esperadas.
- [x] 4.2 Ajustar expectativas si la implementación reveló detalles nuevos (documentar en el resumen de fase).

## 5. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Ejecutar `npm run test` (Vitest) y verificar VERDE completo, incluida la suite de env y db.
- [x] 5.2 Ejecutar `npm run typecheck`, `npm run lint` y `npm run build` en verde.
- [x] 5.3 Verificación de BD: documentar como NO APLICABLE (Prisma sin modelos, sin conexión real a Neon en este ticket).
- [x] 5.4 Crear informe `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/2026-07-10-step-5-unit-test-and-db-verification.md`.

## 6. Pruebas manuales con curl (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Arrancar el servidor Next.js (dev o start tras build).
- [x] 6.2 `curl` a `GET /` verificando HTTP 200 y a la ruta del placeholder admin verificando el meta robots noindex (SEC-5).
- [x] 6.3 Crear informe `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/2026-07-10-step-6-curl-endpoint-verification.md`.

## 7. E2E con Playwright (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 7.1 Ejecutar `npm run test:e2e` (smoke home 200) y verificar VERDE.
- [x] 7.2 Crear informe `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/2026-07-10-step-7-playwright-e2e-verification.md`.

## 8. Security scan (fase 5b del harness)

- [x] 8.1 Ejecutar `npm audit --omit=dev` y evaluar hallazgos critical/high (SEC-3).
- [x] 8.2 Verificar ausencia de secretos (gitleaks o revisión del diff) en `.env.example` y código (SEC-2).
- [x] 8.3 Verificar SEC-1 (build falla si un Client Component importa `lib/env.ts`) y documentar la evidencia.
- [x] 8.4 Crear `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/security.md` con hallazgos clasificados por severidad.

## 9. Actualizar documentación técnica (OBLIGATORIO)

- [x] 9.1 Revisar si `docs/technical/backend-standards.md` o `frontend-standards.md` requieren nota sobre el andamiaje creado (solo si introduce convención nueva).
- [x] 9.2 `docs/technical/api-spec.yml` y `data-model.md`: sin cambios (sin endpoints ni modelos); confirmar y documentar.
- [x] 9.3 Confirmar que toda la documentación nueva está en español.

## 10. Code review y verificación OpenSpec antes de archivar (OBLIGATORIO)

- [x] 10.1 Obtener informe de code review con línea `Veredicto: APTO` en `openspec/changes/gtk-21-bootstrap-nextjs-stack/reports/code-review.md`.
- [x] 10.2 Ejecutar `bash ai-specs/scripts/require-code-review.sh gtk-21-bootstrap-nextjs-stack` y verificar exit 0.
- [x] 10.3 Archive completado (2026-07-10). PR omitido por decisión explícita del usuario en Gate 2.
