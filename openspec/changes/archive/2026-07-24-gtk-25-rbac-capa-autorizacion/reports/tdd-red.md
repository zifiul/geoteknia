# TDD-RED — gtk-25-rbac-capa-autorizacion

- Fecha: 2026-07-24
- Cambio: `gtk-25-rbac-capa-autorizacion`
- Agente: harness-orchestrator (fase 3, skills `tdd-core` + `security-test-cases`)

## Suites creadas

| Fichero | Requisito(s) de `specs/rbac-authorization/spec.md` cubiertos |
|---|---|
| `tests/unit/auth/rbac.test.ts` | Comprobación de permiso atómico (`can`); requirePermission (sesión/permiso); pertenencia (`assertOwnership`); wrappers `withPermission`/`withRoutePermission`; denegación sin fuga de existencia |
| `tests/unit/auth/session-portal.test.ts` | `getPortalSession` cablea `requireSession` con dependencias reales (espejo de sesión en BD) |

Trazabilidad SEC-N (threat model de `design.md`):

- **SEC-1** (permiso atómico, 4 roles × 17 permisos): `rbac.test.ts` → `describe('can ...')`, `describe('requirePermission ...')`.
- **SEC-2** (pertenencia `tecnico`): `rbac.test.ts` → `describe('assertOwnership ...')`.
- **SEC-3** (espejo de sesión en BD, no solo JWT): `rbac.test.ts` → tests de sesión revocada/expirada de `requirePermission`; `session-portal.test.ts` → los 5 tests de `getPortalSession`.
- **SEC-4** (sin efectos secundarios en denegación): `rbac.test.ts` → `describe('withPermission ...')` y `describe('withRoutePermission ...')`, aserción `handler` no invocado.
- **SEC-5** (sin fuga de existencia): `rbac.test.ts` → test `"el cuerpo de error no revela si el recurso existe"`.

## Comandos ejecutados

- `npx vitest run tests/unit/auth/rbac.test.ts tests/unit/auth/session-portal.test.ts`
- `npm run test` (suite completa `tests/unit`)

## Resultado del runner (RED)

```
Test Files  2 failed | 12 passed (14)
     Tests  5 failed | 59 passed (64)
```

- `tests/unit/auth/rbac.test.ts`: falla al cargar el módulo — `Cannot find package '@/lib/auth/rbac-errors'` (y transitivamente `@/lib/auth/rbac`). Fallo controlado: los módulos de producción de esta US aún no existen.
- `tests/unit/auth/session-portal.test.ts`: 5/5 tests fallan con `TypeError: getPortalSession is not a function` — el export aún no existe en `lib/auth/session.ts`.
- Los 12 ficheros de test preexistentes (59 tests) siguen en verde: no se ha tocado código de producción en esta fase.

## Qué debe construir la fase 4

1. `lib/auth/rbac-errors.ts` — `ForbiddenError extends Error`.
2. `lib/auth/rbac.ts` — `can`, `requirePermission`, `assertOwnership`, `withPermission`, `withRoutePermission`.
3. `lib/auth/session.ts` — añadir `getPortalSession()`.
4. `lib/auth/config.ts` — exponer `sessionTokenHash` en `session.user` (`session()` callback), descubierto durante esta fase y ya registrado en `design.md`/`proposal.md`/`tasks.md`.
5. `lib/auth/index.ts` — `export * from './rbac'`.

## Escenarios E2E especificados para la fase 5a

Ninguno: no existe caso de uso real bajo `app/(admin)/**` (ver `tasks.md` §7, bloqueado y documentado).

## Categorías de abuse cases descartadas (catálogo `security-test-cases`)

- Validación de inputs (payloads Zod): N/A, esta primitiva no recibe input de usuario.
- Abuso de formularios públicos (Turnstile/rate limit): N/A, sin endpoint público.
- PII/RGPD: N/A, sin datos personales en esta capa.
- IA: N/A.
- Auditoría: esta US no escribe `audit_logs`; cubierto indirectamente por SEC-4 (sin efectos secundarios en denegación).
