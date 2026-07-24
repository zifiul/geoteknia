# Tasks — gtk-25-rbac-capa-autorizacion

> US: GTK-25 — RBAC: capa de autorización para Route Handlers y Server Actions
> Fases omitidas: contrato API (2 — librería interna sin endpoint propio); frontend (4b — sin UI); E2E Playwright (bloqueado, ver paso 6).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `openspec/config.yaml` y `docs/technical/backend-standards.md` (RBAC, autorización).
- [x] 0.2 Crear rama `feature/backend-gtk-25-rbac-autorizacion` desde `main`.
- [x] 0.3 Verificar rama actual (`git branch --show-current`) y `git status`.
- [x] 0.4 Confirmar que no se sobrescribe trabajo no relacionado (único fichero previo: `docs/GTK-25-rbac-capa-autorizacion.md`, no relacionado con código).

## 1. Errores y wrapper de sesión cableado

- [x] 1.1 Crear `lib/auth/rbac-errors.ts` con `ForbiddenError extends Error` (403).
- [x] 1.2 Añadir `getPortalSession()` en `lib/auth/session.ts`: cablea `getAuthSession` (vía `auth()` de `lib/auth/config.ts` + `hashSessionToken`) y `findSessionMirror` (consulta `sessions` por `token_hash` vía `lib/db`) a `requireSession(deps)`.
- [x] 1.3 Modificar `lib/auth/config.ts` (`session()` callback): exponer `sessionTokenHash` en `session.user` (mismo patrón que `roleId`/`roleName`), necesario para que `getPortalSession()` obtenga el `tokenHash` a consultar.

## 2. Primitiva de autorización lib/auth/rbac.ts

- [x] 2.1 Implementar `can(user, permissionCode)` sobre `resolvePermissionCodesForRole` (sin BD).
- [x] 2.2 Implementar `requirePermission(permissionCode)` usando `getPortalSession()` → `InvalidSessionError` (401) / `ForbiddenError` (403) / `PortalSessionPayload`.
- [x] 2.3 Implementar `assertOwnership(resource, user)` (no-op admin/gestor; `tecnico` exige `assignedTechnicianId === userId`).
- [x] 2.4 Implementar `withPermission(code, handler)` (Server Actions).
- [x] 2.5 Implementar `withRoutePermission(code, handler)` (Route Handlers; traduce 401/403 a `Response` con cuerpo `{ success: false, error: { code, message } }`).
- [x] 2.6 Actualizar `lib/auth/index.ts`: `export * from './rbac'` + `export * from './rbac-errors'`.

## 3. Tests (TDD / Vitest)

- [x] 3.1 Tests `can()`: matriz completa de los 4 roles contra los 17 permisos de `PERMISSIONS`, usando `resolvePermissionCodesForRole` como oráculo (SEC-1).
- [x] 3.2 Tests `assertOwnership()`: técnico dueño (pasa), técnico ajeno (`ForbiddenError`), admin/gestor (siempre pasa) (SEC-2).
- [x] 3.3 Tests `requirePermission()`: sin sesión, sesión revocada, sesión expirada (`InvalidSessionError`, 401 — mock de deps verificando que se consulta el espejo en BD), sesión válida sin permiso (`ForbiddenError`, 403), sesión válida con permiso (pasa) (SEC-3).
- [x] 3.4 Tests `withPermission`/`withRoutePermission`: no invocan el handler de negocio ni escriben en `audit_logs` cuando deniegan; delegan al handler cuando conceden (SEC-4, SEC-5).

## 4. Revisar y actualizar tests existentes (OBLIGATORIO)

- [x] 4.1 Revisado `tests/unit/auth/session-mirror.test.ts` (`requireSession`, `evaluateSessionMirror`): sigue en verde, `getPortalSession()` es aditivo y no modifica su firma ni comportamiento.
- [x] 4.2 Revisados `tests/unit/auth/**` existentes (login, session, permissions): sin solapamiento con los tests nuevos de `rbac.ts`/`session-portal.test.ts`.
- [x] 4.3 No se duplican tests de `permissions.ts` (matriz ya cubierta en `permissions.test.ts`); `rbac.test.ts` solo usa `resolvePermissionCodesForRole` como oráculo.

## 5. Ejecutar tests unitarios y verificar base de datos (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 5.1 Esta US no persiste ni muta datos (sin schema, sin escritura); exención de línea base de BD documentada en el informe.
- [x] 5.2 Ejecutar tests dirigidos (`lib/auth/rbac*`, `lib/auth/session*`).
- [x] 5.3 Ejecutar suite completa (`npm run test`), `npm run typecheck`, `npm run lint`.
- [x] 5.4 Crear informe `openspec/changes/gtk-25-rbac-capa-autorizacion/reports/2026-07-24-step-5-unit-test-and-db-verification.md`.
- [x] 5.5 Marcado completado: tests, verificación y reporte correctos.

## 6. Pruebas manuales de endpoints con curl — OMITIDA (documentado)

> No aplica: esta US no crea ni modifica ningún Route Handler (`app/api/**/route.ts`). `withRoutePermission` es una función de librería sin endpoint propio que ejercitar por HTTP. Los tickets que consuman `withRoutePermission` en sus propios endpoints ejecutarán este paso en su propio `tasks.md`.

## 7. E2E Playwright MCP — BLOQUEADO (documentado)

> No aplica todavía: no existe ningún caso de uso real bajo `app/(admin)/**` (solo el placeholder `app/(admin)/admin/page.tsx`, sin Server Actions ni Route Handlers de negocio). No se simula una ruta ficticia solo para cerrar el ticket. Este paso se retoma cuando exista el primer módulo consumidor (proyectos/contenido/IA/usuarios).

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 Documentado en `docs/technical/backend-standards.md` §8.3 (Auth.js, RBAC y 2FA — sección correcta, no §3.4 que es SOLID/DRY) las dos decisiones clave: (a) `can()` resuelve en memoria, no contra `role_permissions`; (b) la autorización usa `getPortalSession()` con espejo en BD, nunca `getServerSession()` solo-JWT. Añadida también la regla de `assertOwnership`/anti-enumeración.
- [x] 8.2 `docs/technical/api-spec.yml`: sin cambios (sin endpoint propio) — confirmado.
- [x] 8.3 `docs/technical/data-model.md`: sin cambios (sin schema nuevo) — confirmado.
- [x] 8.4 Confirmado: toda la documentación añadida está en español.

## 9. Verificación OpenSpec antes de archivar (OBLIGATORIO)

- [x] 9.1 `/opsx:verify` no está disponible en el perfil instalado (comandos disponibles: `apply`, `archive`, `explore`, `propose`, `sync` — sin `verify`). Riesgo alto compensado con revisión adversarial completa en `reports/code-review.md` (checklist OWASP + trazabilidad spec↔código↔test).
- [x] 9.2 Sin hallazgos críticos/bloqueantes pendientes (ver `reports/code-review.md`).
- [x] 9.3 `proposal.md`/`design.md`/`tasks.md` actualizados durante TDD-RED (adición de `lib/auth/config.ts` al alcance, justificada y sin alterar el contrato aprobado en Gate 1).
- [x] 9.4 Ejecutado `openspec validate gtk-25-rbac-capa-autorizacion --strict` → válido (dos veces: tras SDD y tras cierre de artefactos). `/opsx:sync` se ejecutará como parte de `/opsx:archive`.
- [x] 9.5 Ejecutado `bash ai-specs/scripts/require-code-review.sh gtk-25-rbac-capa-autorizacion` → `GATE require-code-review: OK — veredicto APTO`.
