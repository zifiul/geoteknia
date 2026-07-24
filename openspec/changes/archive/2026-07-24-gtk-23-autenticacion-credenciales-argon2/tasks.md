# Tasks — gtk-23-autenticacion-credenciales-argon2

> US: [GTK-23](https://linear.app/geoteknia/issue/GTK-23/autenticacion-del-portal-con-authjs-v5-credenciales-argon2) — Autenticación del portal con Auth.js v5
> Rama: `feature/backend-gtk-23-autenticacion-credenciales-argon2`
> Fases omitidas: 4b frontend (UI = GTK-69). E2E UI condicionado a GTK-69 (documentar bloqueo).

## 0. Setup (OBLIGATORIO — primero)

- [x] 0.1 Crear rama `feature/backend-gtk-23-autenticacion-credenciales-argon2` desde `main` / `origin/main`.
- [x] 0.2 Verificar rama activa y `git status` (no pisar trabajo no relacionado).
- [x] 0.3 Abrir change OpenSpec `gtk-23-autenticacion-credenciales-argon2` con proposal/design/specs/tasks.

## 1. Contrato (fase 2 — tras Gate 1)

- [x] 1.1 Crear schema Zod compartido de login (`email`, `password` min 8, `totp` opcional length 6) en módulo acordado (`lib/auth/` o `lib/validations/`).
- [x] 1.2 Actualizar `docs/technical/api-spec.yml` con rutas Auth.js `/api/auth/*` y Server Action `loginAction` (seguridad: público, sin RBAC; rate limit documentado como GTK-26).
- [x] 1.3 Congelar contrato (artefactos en disco listos para TDD).

## 2. TDD-RED (fase 3)

- [x] 2.1 Tests unitarios `passwords`: hash distinto por sal, verify true/false, formato argon2id.
- [x] 2.2 Tests caso de uso / `authorize`: activo+OK, inactivo, password incorrecta, user inexistente, `twofa_enabled` sin verificador (fail-closed) — abuse SEC-1/SEC-3/SEC-6.
- [x] 2.3 Tests `session` / `requireSession`: válida, revocada, expirada (SEC-4/SEC-5).
- [x] 2.4 Tests audit: `login` / `login_failed` sin secretos en metadata (SEC-2/SEC-7).
- [x] 2.5 Ejecutar Vitest y adjuntar evidencia RED (tests nuevos fallan) antes de implementar — ver `reports/2026-07-24-step-2-tdd-red.md`.

## 3. Implementación backend (fase 4a)

- [x] 3.1 Añadir `SESSION_TTL_MINUTES` a `lib/env.ts` y `.env.example`.
- [x] 3.2 Crear `lib/auth/passwords.ts` (argon2id, `server-only`).
- [x] 3.3 Crear lógica de dominio de login / authorize testeable + punto de extensión `verifyTotp` fail-closed.
- [x] 3.4 Crear `lib/auth/config.ts` (Credentials, callbacks jwt/session, mirror `sessions`, `pages.signIn`).
- [x] 3.5 Crear `lib/auth/session.ts` (`getServerSession`, `requireSession`, tipado).
- [x] 3.6 Crear `lib/auth/login-action.ts` (Server Action delgada).
- [x] 3.7 Crear `app/api/auth/[...nextauth]/route.ts` (`handlers` GET/POST).
- [x] 3.8 Integrar `recordAudit` + `extractRequestAuditContext`; actualizar `last_login_at` en éxito.
- [x] 3.9 No modificar `lib/auth/permissions.ts` ni schema Prisma; poner tests de fase 3 en VERDE.

## 4. Revisar tests existentes (OBLIGATORIO)

- [x] 4.1 Revisar tests de `lib/auth/permissions.ts` y suite relacionada; adaptar si colisionan con nuevos módulos.
- [x] 4.2 Revisar tests de `lib/env.ts` / `env-validation` tras añadir `SESSION_TTL_MINUTES`.

## 5. Tests unitarios + verificación BD (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Capturar línea base de conteos `sessions` / `audit_logs` (y filas de usuario de prueba si aplica).
- [x] 5.2 Ejecutar tests dirigidos del módulo auth + suite del proyecto (`npm test` / Vitest).
- [x] 5.3 Verificar mirror en `sessions` (token hasheado) y filas de audit; restaurar datos de prueba.
- [x] 5.4 Crear informe `openspec/changes/gtk-23-autenticacion-credenciales-argon2/reports/YYYY-MM-DD-step-5-unit-test-and-db-verification.md`.

## 6. curl endpoints Auth.js (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 6.1 Arrancar Next.js y verificar conexión a BD.
- [x] 6.2 `GET /api/auth/csrf` → 200 + token.
- [x] 6.3 `POST /api/auth/callback/credentials` con credenciales válidas → sesión/cookie + fila `sessions` + audit `login`.
- [x] 6.4 Misma ruta con inválidas / usuario inactivo → error genérico + audit `login_failed`; sin sesión válida.
- [x] 6.5 Limpiar datos de prueba (sessions/audit/users de test) y crear informe `reports/YYYY-MM-DD-step-6-curl-endpoint-verification.md`.

## 7. E2E Playwright (OBLIGATORIO si aplica - AGENTE DEBE EJECUTAR)

- [x] 7.1 Si `app/(admin)/login` (GTK-69) no existe: documentar bloqueo y limitar a invocación programática de `loginAction`/`signIn` o marcar escenarios UI como bloqueados.
- [ ] 7.2 Si la UI existe: flujo login OK / fallo con Playwright MCP; restaurar sesiones. _(N/A — GTK-69)_
- [x] 7.3 Crear informe `reports/YYYY-MM-DD-step-7-playwright-e2e-verification.md`.

## 8. Security scan + code review + docs

- [x] 8.1 Security scan (SAST/SCA/secrets/DAST ligero) → `reports/security.md`.
- [x] 8.2 Code review gate → `reports/code-review.md` con `Veredicto: APTO` o correcciones.
- [x] 8.3 Docs (OBLIGATORIO): sin cambio de `data-model.md`; actualizar `api-spec.yml` (ya en §1); valorar nota de patrón Auth.js en `backend-standards.md` §8.3; `.env.example` con `SESSION_TTL_MINUTES`.

## 9. Archive (tras Gate 2 humano)

- [ ] 9.1 Ejecutar `bash ai-specs/scripts/require-code-review.sh gtk-23-autenticacion-credenciales-argon2`.
- [ ] 9.2 `/opsx:verify` y `/opsx:archive`; comentar en Linear con ruta de archive.
