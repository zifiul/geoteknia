# Code Review — gtk-25-rbac-capa-autorizacion

- Fecha: 2026-07-24
- Diff revisado: working tree vs `main` (7 ficheros): `lib/auth/config.ts`, `lib/auth/index.ts`, `lib/auth/session.ts` (modificados); `lib/auth/rbac.ts`, `lib/auth/rbac-errors.ts` (nuevos); `tests/unit/auth/rbac.test.ts`, `tests/unit/auth/session-portal.test.ts` (nuevos). Además `docs/technical/backend-standards.md` §8.3 (docs).
- Evidencia revisada: `reports/tdd-red.md`, `reports/2026-07-24-step-5-unit-test-and-db-verification.md`, `reports/security.md`.

## Alineación spec ↔ implementación

Contraste contra `specs/rbac-authorization/spec.md` (6 requisitos ADDED):

| Requisito | Implementación | Test |
|---|---|---|
| `can()` en memoria | `lib/auth/rbac.ts:17-19` — `resolvePermissionCodesForRole(...).includes(...)`, sin BD | `rbac.test.ts` → `describe('can ...')` (4 roles × 17 permisos) |
| `requirePermission()` con espejo BD | `rbac.ts:25-35` usa `getPortalSession()` (nunca `getServerSession()`) | `rbac.test.ts` → `describe('requirePermission ...')` |
| `getPortalSession()` cablea `requireSession` real | `session.ts` (nuevo bloque al final) | `session-portal.test.ts` (5 tests, incl. consulta por `tokenHash`) |
| `assertOwnership()` | `rbac.ts:42-53` | `rbac.test.ts` → `describe('assertOwnership ...')`, incluye caso `assignedTechnicianId: null` no cubierto explícitamente en la spec pero coherente con "exige igualdad estricta" |
| `withPermission`/`withRoutePermission` no ejecutan el handler en denegación | `rbac.ts:56-89` | `rbac.test.ts` → ambos `describe`, incl. verificación de que no se invoca `handler` |
| Sin fuga de existencia de recurso | Mensajes genéricos por defecto en `ForbiddenError`/`InvalidSessionError`, nunca parametrizados con datos del recurso | `rbac.test.ts` → test `"SEC-5: el cuerpo de error no revela..."` |

Sin desviaciones de alcance no documentadas: el único cambio no anticipado en la propuesta original (exponer `sessionTokenHash` en `session.user` de `config.ts`) se descubrió en TDD-RED y quedó registrado en `proposal.md`, `design.md` (nota de alcance) y `tasks.md` antes de implementarlo — no altera el contrato funcional aprobado en Gate 1 (sigue sin API/UI nueva).

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|---|---|---|---|---|
| Menor | `lib/auth/rbac.ts` (`withRoutePermission`) | El `try/catch` envuelve tanto `requirePermission()` como la llamada al `handler`; si el propio handler de negocio lanzara una `ForbiddenError`/`InvalidSessionError` por una razón distinta a la comprobación inicial, se traduciría igualmente a 401/403 genérico. Es un comportamiento razonable (cualquier denegación de esta capa, venga de donde venga, debe traducirse a HTTP) pero no estaba explícito en `design.md`. Verificado que errores de negocio de **otro tipo** sí se propagan sin envolver (test añadido). | `rbac.ts:75-87`; test `"propaga sin envolver un error de negocio del handler (no auth)"` en `rbac.test.ts` | Ninguno obligatorio; opcionalmente documentar la regla en `design.md` si un ticket futuro anida `requirePermission`/`assertOwnership` dentro de un handler ya envuelto |
| Menor | `lib/auth/session.ts` (`getPortalSession`) | `findSessionMirror` importa `@/lib/db` dinámicamente dentro del closure, sin necesidad real (no hay dependencia circular con `db.ts`, a diferencia de `config.ts`). Es solo una inconsistencia de estilo frente a un `import` estático, sin impacto funcional. | `session.ts` (bloque nuevo) | Opcional: mover a `import { db } from '@/lib/db'` estático en un futuro refactor menor |
| Aceptado (no bloqueante) | Dependencias (SCA) | 5 vulnerabilidades preexistentes en `@auth/core`/`next`/`postcss`/`sharp`, no introducidas por esta US (sin cambios en `package.json`) | `reports/security.md` | Ticket de mantenimiento de dependencias independiente (ya recomendado en el propio informe) |

Sin hallazgos Bloqueantes ni Mayores.

## Sección de seguridad

- Resultado del scan (5b): **HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** (`reports/security.md`) — el único hallazgo alto/crítico (SCA) es preexistente y ajeno al diff de esta US; justificación validada en esta revisión (no hay cambio de dependencias, el hallazgo afecta a todo el repo desde antes de GTK-25).
- SAST: LIMPIO (0 findings sobre 563 reglas, incluidos los ficheros de esta US).
- Secretos: LIMPIO (gitleaks + verificación manual por patrón sobre los ficheros nuevos).
- DAST: OMITIDO correctamente (sin Route Handlers en esta US).
- Checklist OWASP Top 10 (adaptado):
  - **A01 Broken Access Control:** cumplido — `requirePermission`/`assertOwnership` son la única vía de autorización; sin checks ad hoc; 403 uniforme sin distinguir "no existe" vs "no es tuyo" (SEC-5).
  - **A02 Cryptographic Failures:** sin cambios (reutiliza `hashSessionToken`/argon2 ya existentes).
  - **A03 Injection:** N/A — sin input de usuario ni SQL crudo en esta US.
  - **A04 Insecure Design:** los 5 requisitos SEC-1..SEC-5 del threat model están implementados y testeados (ver tabla de trazabilidad en `reports/tdd-red.md`).
  - **A05 Security Misconfiguration:** `import 'server-only'` presente en `rbac.ts`; ausente intencionalmente en `rbac-errors.ts` (solo clases de error, sin acceso a Prisma/secretos — coherente con `session.ts` que tampoco lo requiere para sus tipos/errores puros).
  - **A07 Auth Failures:** `getPortalSession()` fuerza comprobación de revocación/expiración en BD; `getServerSession()` (solo-JWT) explícitamente no se usa para autorización.
  - **A08 Integridad de dependencias:** sin dependencias nuevas.
  - **A09 Logging:** sin logs nuevos; ninguna denegación registra información sensible.
  - Desviaciones: ninguna.

## Evidencia de QA

- Tests unitarios: 82/82 passed (suite completa `tests/unit`, 14 ficheros), `npm run typecheck` y `npm run lint` sin errores — `reports/2026-07-24-step-5-unit-test-and-db-verification.md` (PASS).
- Verificación de BD: N/A justificada (sin persistencia en esta US).
- `curl`/E2E: omitidos y bloqueados con justificación explícita en `tasks.md` §6/§7 (sin endpoint propio; sin caso de uso real bajo `app/(admin)/**` todavía).

Veredicto: APTO
