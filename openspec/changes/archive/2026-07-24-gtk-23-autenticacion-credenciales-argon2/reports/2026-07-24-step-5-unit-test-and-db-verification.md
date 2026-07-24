# Informe Step 5 — Tests unitarios y verificación de base de datos

- Fecha: 2026-07-24
- Cambio: gtk-23-autenticacion-credenciales-argon2
- Agente: Composer

## Comandos ejecutados

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npx tsx scripts/gtk23-db-baseline.ts` (antes y después de pruebas con escritura)

## Resultados de tests

- Suite unitaria: **59 passed**, 0 failed, 0 skipped
- Lint: OK
- Typecheck: OK

## Verificación de base de datos

| Métrica | Línea base (pre-curl) | Tras pruebas curl | Tras cleanup |
|---|---:|---:|---:|
| `sessions` | 0 | 1 (login OK) | 0 |
| `audit_logs` (login/login_failed) | 0 | 6 | 6 |
| `users` | 0 | 2 (fixture QA) | 0 |

- Usuarios de prueba: `gtk23-curl-qa@test.geoteknia.local`, `gtk23-curl-inactive@test.geoteknia.local` (eliminados con `scripts/gtk23-curl-fixture.ts cleanup`).
- Filas `audit_logs` de QA: **append-only** (6 entradas); no se borran; aceptable como evidencia de auditoría de prueba.
- **Estado restaurado:** Sí (usuarios y sesiones de prueba eliminados).

## Correcciones detectadas en QA

1. `loginInputSchema`: `totp: ""` de Auth.js → tratado como ausente (`z.preprocess`).
2. `authorize`: parsear solo `{ email, password, totp }` (no `strict` sobre credenciales con `csrfToken`).
3. No exponer `sessionTokenHash` en objeto `session` del cliente.

## Resultado

- Estado del paso 5: **PASS**
- Bloqueos: ninguno
