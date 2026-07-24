# Informe Step 7 — Verificación HTTP / Server Actions (GTK-24)

- Fecha: 2026-07-24
- Cambio: gtk-24-segundo-factor-totp
- Servidor: `npm run start -- -p 3011` (variables QA exportadas; `TWOFA_ENCRYPTION_KEY` desde `.env`)

## Preparación

- `npx tsx scripts/gtk24-totp-fixture.ts setup` — usuario `gtk24-qa@test.geoteknia.local` / `Gtk24QaTest1!`
- Usuario con `twofa_enabled=true` y secreto cifrado preparado por `tests/qa/gtk24-http-login.qa.test.ts` (`beforeAll`)
- Verificador TOTP activo vía build que importa `lib/auth/totp-verifier` en `config`

## Pruebas ejecutadas

Automatizadas (equivalente curl, vía `fetch`):

```bash
npx vitest run tests/qa/gtk24-http-login.qa.test.ts
```

| Escenario | Resultado |
|---|---|
| `GET /api/auth/csrf` | 200 + `csrfToken` |
| Login con email/password/TOTP válido | 200/302; fila en `sessions` para el usuario QA |
| Login sin `totp` con 2FA activo | 401/302/403 (rechazo) |

## SEC-2 / SEC-5

- Respuestas comprobadas: JSON de sesión **no** contiene el secreto TOTP en claro.
- Nota: `GET /api/auth/session` devuelve actualmente `sessionTokenHash` en `user` (comportamiento heredado de `lib/auth/config.ts`; fuera de alcance GTK-24 salvo hardening posterior).

## Limpieza

- `afterAll` del test HTTP elimina usuario QA, sesiones y audits asociados.
- `npx tsx scripts/gtk24-totp-fixture.ts cleanup` si queda residuo.

## Resultado

- Estado del paso 7: **PASS** (cobertura HTTP Auth.js + TOTP)
- Bloqueos: ninguno con servidor en `:3011`
