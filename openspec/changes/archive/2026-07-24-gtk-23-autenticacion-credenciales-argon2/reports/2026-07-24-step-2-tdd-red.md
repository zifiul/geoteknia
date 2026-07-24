# Informe TDD-RED — GTK-23 (fase 3)

- Fecha: 2026-07-24
- Change: `gtk-23-autenticacion-credenciales-argon2`
- Agente: harness / Composer

## Suites creadas

| Fichero | Requisitos / SEC |
|---|---|
| `tests/unit/auth/login-schemas.test.ts` | Contrato Zod, SEC-6 |
| `tests/unit/auth/passwords.test.ts` | Hash argon2id (delta spec portal-auth) |
| `tests/unit/auth/authenticate-credentials.test.ts` | authorize / login, SEC-1, SEC-3 |
| `tests/unit/auth/session-mirror.test.ts` | Espejo sesión, `requireSession`, SEC-4 |
| `tests/unit/auth/login-audit.test.ts` | `login` / `login_failed`, SEC-2, SEC-7 |

## Comando ejecutado

```bash
npx vitest run tests/unit/auth/login-schemas.test.ts tests/unit/auth/passwords.test.ts tests/unit/auth/authenticate-credentials.test.ts tests/unit/auth/session-mirror.test.ts tests/unit/auth/login-audit.test.ts
```

## Resultado RED (esperado)

```
Test Files  4 failed | 1 passed (5)
Tests       5 passed (5)
```

- **Verde (contrato fase 2):** `login-schemas.test.ts` — 5 tests OK.
- **ROJO (módulos pendientes fase 4):** 4 suites fallan al importar:
  - `@/lib/auth/passwords`
  - `@/lib/auth/authenticate-credentials`
  - `@/lib/auth/session`
  - `@/lib/auth/login-audit`

## Regresión suite unitaria

```bash
npx vitest run tests/unit
```

```
Test Files  4 failed | 8 passed (12)
Tests       38 passed (38)
```

Los 38 tests preexistentes + contrato login-schemas siguen en verde; solo fallan las 4 suites sin módulo de producción.

## Contrato de implementación (fase 4a)

Implementar en `/lib`:

1. **`passwords.ts`** — `hashPassword`, `verifyPassword` (argon2id, `server-only`).
2. **`authenticate-credentials.ts`** — `authenticateCredentials(input, deps)` con reasons `invalid_credentials`, `totp_unavailable`; mismo mensaje externo para SEC-1.
3. **`session.ts`** — `evaluateSessionMirror`, `requireSession(deps)` inyectable para tests; integración con Auth.js en config.
4. **`login-audit.ts`** — `recordLoginSuccessAudit`, `recordLoginFailedAudit` delegando en `recordAudit`.
5. **`config.ts`**, **`login-action.ts`**, **`app/api/auth/[...nextauth]/route.ts`** — cableado Auth.js + mirror BD + audit.

## E2E especificados (fase 5a / GTK-69)

- Login UI OK con credenciales válidas → redirección `/admin` (bloqueado si no existe página GTK-69).
- Login fallido → mensaje genérico.
- Alternativa sin UI: curl a `/api/auth/callback/credentials` + invocación programática de `loginAction`.

## Abuse cases omitidos (justificación)

| Categoría | Motivo |
|---|---|
| Rate limit 429 | GTK-26; documentado en contrato; test cuando exista limitador |
| Turnstile | No aplica a login interno |
| RBAC en login | Endpoint público por diseño |
