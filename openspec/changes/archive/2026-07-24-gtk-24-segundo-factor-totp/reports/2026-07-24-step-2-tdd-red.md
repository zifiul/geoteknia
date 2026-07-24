# Informe TDD-RED — GTK-24 (fase 3)

- Fecha: 2026-07-24
- Change: `gtk-24-segundo-factor-totp`
- Rama: `feature/backend-gtk-24-segundo-factor-totp`

## Contexto

La implementación (fase 4) se adelantó respecto al harness formal. Esta fase **consolida** la batería de tests alineada con delta specs y SEC-N, verifica **VERDE** end-to-end y deja el contrato de implementación documentado para QA (fase 5a).

## Suites y trazabilidad

| Fichero | Requisitos / SEC |
|---|---|
| `tests/unit/auth/totp-schemas.test.ts` | Contrato fase 2, SEC-6 (strict) |
| `tests/unit/auth/totp-core.test.ts` | Delta `portal-auth-totp` generación/ventana |
| `tests/unit/auth/crypto.test.ts` | Cifrado en reposo |
| `tests/unit/auth/totp-verifier.test.ts` | Verificador login |
| `tests/unit/auth/totp-actions.test.ts` | Actions + SEC-2, SEC-3, SEC-4, SEC-6, SEC-7 |
| `tests/unit/auth/authenticate-credentials.test.ts` | Login 2FA, SEC-1 |
| `tests/unit/auth/login-schemas.test.ts` | Campo `totp`, SEC-6 |
| `tests/unit/audit/sanitize.test.ts` | Whitelist `event`, SEC-5 |
| `tests/unit/audit/log.test.ts` | `recordAudit` + `event` persistido, SEC-5 |
| `tests/unit/env.test.ts` | `TWOFA_ENCRYPTION_KEY` |

## Comando ejecutado (GTK-24 auth + audit)

```bash
npx vitest run tests/unit/auth/totp-schemas.test.ts tests/unit/auth/totp-core.test.ts tests/unit/auth/crypto.test.ts tests/unit/auth/totp-verifier.test.ts tests/unit/auth/totp-actions.test.ts tests/unit/auth/authenticate-credentials.test.ts tests/unit/auth/login-schemas.test.ts tests/unit/audit/sanitize.test.ts tests/unit/audit/log.test.ts tests/unit/env.test.ts
```

## Resultado (estado actual — VERDE)

Tras añadir abuse cases SEC-2/3/4/6/7 en `totp-actions.test.ts` y SEC-5 en `log.test.ts`, la suite GTK-24 queda en **verde** (implementación ya presente). No se re-ejecutó RED artificial eliminando módulos de producción.

```bash
npm test
```

```
Test Files  19 passed (19)
Tests       110 passed (110)
```

## RED histórico (referencia)

En un flujo estricto gate-antes-de-impl, los tests de `totp-core`, `crypto`, `totp-verifier` y `totp-actions` habrían fallado por módulos inexistentes antes de la fase 4a — mismo patrón documentado en GTK-23 (`reports/2026-07-24-step-2-tdd-red.md`).

## Contrato de implementación (fase 4 — cumplido)

| Módulo | Estado |
|---|---|
| `lib/auth/totp-schemas.ts` | ✅ |
| `lib/auth/totp-core.ts` | ✅ |
| `lib/auth/crypto.ts` | ✅ |
| `lib/auth/totp-verifier.ts` + import `config.ts` | ✅ |
| `lib/auth/totp-actions.ts` | ✅ |
| `lib/audit/sanitize.ts` (`event`) | ✅ |
| `app/(admin)/perfil/seguridad/*` | ✅ (4b mínimo) |

Pendiente menor: `tasks.md` §3.8 / §4.3 (accesibilidad copy).

## E2E especificados (fase 5a / §8 tasks)

1. Enrolar 2FA en `/perfil/seguridad` (QR + confirmación).
2. Cerrar sesión; login con email/password + TOTP válido.
3. Login con TOTP incorrecto → error genérico (SEC-1).
4. Desactivar 2FA con contraseña + TOTP; comprobar audit en BD.

## Abuse cases omitidos (justificación)

| Categoría | Motivo |
|---|---|
| Rate limit 429 en confirm/disable/generate | GTK-26; contrato documenta expectativa |
| Turnstile | Acciones internas con sesión, no formulario público |
| RBAC por rol | Self-service; SEC-6 cubre sesión inválida |
| SEC-7 transacción Prisma real | Cubierto por propagación de error de `recordAudit` en action test; integración BD en fase 6 |

## SEC-N ↔ tests

| SEC | Cobertura |
|---|---|
| SEC-1 | `authenticate-credentials.test.ts` (TOTP ausente/inválido; verificador OK) |
| SEC-2 | `totp-actions` generate sin campo `secret`; `login-schemas` / audit redacción |
| SEC-3 | `totp-actions` confirm código inválido / validation |
| SEC-4 | `totp-actions` disable password/TOTP |
| SEC-5 | `sanitize.test.ts`, `log.test.ts`, metadata en confirm/disable mocks |
| SEC-6 | `totp-actions` UNAUTHORIZED; `totp-schemas` strict |
| SEC-7 | `totp-actions` audit falla → throw; `log.test` mustAudit publish |
